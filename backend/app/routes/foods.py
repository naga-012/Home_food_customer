from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.food import Food
from app.models.cook import HomeCook
from app.models.user import User
from app.schemas.food import FoodCreate, FoodUpdate, EveningOfferUpdate, FoodOut
from app.utils.dependencies import get_current_user, get_optional_current_user, require_cook
from app.services.recommendation import get_smart_recommendations
from app.services.waste_reduction import apply_evening_discount, remove_evening_discount

router = APIRouter(prefix="/api/foods", tags=["Foods"])

@router.get("", response_model=List[FoodOut])
def list_foods(
    search: Optional[str] = None,
    category: Optional[str] = None,
    food_type: Optional[str] = None,  # VEG, NON_VEG
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    cook_id: Optional[int] = None,
    is_evening_offer: Optional[bool] = None,
    is_today_menu: Optional[bool] = None,
    city: Optional[str] = None,
    only_available: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(Food).join(HomeCook, Food.cook_id == HomeCook.id)
    
    # In general listing, only show approved cooks
    query = query.filter(HomeCook.approval_status == "APPROVED")

    if only_available:
        query = query.filter(Food.is_available == True)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Food.name.ilike(search_pattern),
                Food.description.ilike(search_pattern),
                Food.ingredients.ilike(search_pattern),
                Food.category.ilike(search_pattern),
                HomeCook.kitchen_name.ilike(search_pattern),
            )
        )

    if category and category.lower() != "all":
        query = query.filter(Food.category.ilike(f"%{category}%"))

    if food_type and food_type.upper() != "ALL":
        query = query.filter(Food.food_type == food_type.upper())

    if min_price is not None:
        query = query.filter(Food.price >= min_price)

    if max_price is not None:
        query = query.filter(Food.price <= max_price)

    if cook_id is not None:
        query = query.filter(Food.cook_id == cook_id)

    if is_evening_offer is not None:
        query = query.filter(Food.is_evening_offer == is_evening_offer)

    if is_today_menu is not None:
        query = query.filter(Food.is_today_menu == is_today_menu)

    foods = query.order_by(Food.is_evening_offer.desc(), Food.created_at.desc()).all()
    
    # Inject city onto cook if needed
    for f in foods:
        if f.cook and f.cook.user:
            f.cook.city = f.cook.user.city

    return foods

@router.get("/recommendations")
def recommend_foods(
    current_user: Optional[User] = Depends(get_optional_current_user),
    limit: int = 6,
    db: Session = Depends(get_db),
):
    customer_id = current_user.id if current_user else None
    recommendations = get_smart_recommendations(db, customer_id=customer_id, limit=limit)
    
    results = []
    for item in recommendations:
        f = item["food"]
        f_dict = FoodOut.model_validate(f).model_dump()
        f_dict["recommendation_reason"] = item["reason"]
        results.append(f_dict)
    return results

@router.get("/evening-offers", response_model=List[FoodOut])
def get_evening_offers(db: Session = Depends(get_db)):
    return (
        db.query(Food)
        .join(HomeCook, Food.cook_id == HomeCook.id)
        .filter(
            Food.is_evening_offer == True,
            Food.is_available == True,
            Food.quantity > 0,
            HomeCook.approval_status == "APPROVED"
        )
        .all()
    )

@router.get("/{id}", response_model=FoodOut)
def get_food(id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    if food.cook and food.cook.user:
        food.cook.city = food.cook.user.city
    return food

@router.post("", response_model=FoodOut)
def create_food(
    data: FoodCreate,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    if not current_user.cook_profile:
        raise HTTPException(status_code=400, detail="User does not have a cook profile")

    cook_id = current_user.cook_profile.id

    food = Food(
        cook_id=cook_id,
        name=data.name,
        description=data.description,
        category=data.category,
        price=data.price,
        discount_price=data.discount_price,
        is_evening_offer=data.is_evening_offer,
        quantity=data.quantity,
        ingredients=data.ingredients,
        image_url=data.image_url,
        food_type=data.food_type,
        preparation_time=data.preparation_time,
        is_available=data.is_available,
        is_today_menu=data.is_today_menu,
    )
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

@router.put("/{id}", response_model=FoodOut)
def update_food(
    id: int,
    data: FoodUpdate,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    # Authorize owner cook
    if not current_user.cook_profile or food.cook_id != current_user.cook_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this food item")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(food, field, value)

    # Automatic Sold-Out handling
    if food.quantity <= 0:
        food.is_available = False

    db.commit()
    db.refresh(food)
    return food

@router.delete("/{id}")
def delete_food(
    id: int,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if not current_user.cook_profile or food.cook_id != current_user.cook_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this food item")

    db.delete(food)
    db.commit()
    return {"message": f"Food '{food.name}' successfully deleted"}

@router.post("/{id}/evening-offer", response_model=FoodOut)
def set_evening_offer(
    id: int,
    data: EveningOfferUpdate,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if not current_user.cook_profile or food.cook_id != current_user.cook_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this food")

    qty = data.quantity if data.quantity is not None else food.quantity
    updated = apply_evening_discount(db, food_id=id, discount_price=data.discount_price, available_qty=qty)
    return updated

@router.delete("/{id}/evening-offer", response_model=FoodOut)
def cancel_evening_offer(
    id: int,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if not current_user.cook_profile or food.cook_id != current_user.cook_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this food")

    updated = remove_evening_discount(db, food_id=id)
    return updated
