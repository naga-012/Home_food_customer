from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.review import Review
from app.models.food import Food
from app.models.cook import HomeCook
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut
from app.utils.dependencies import get_current_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewOut)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == data.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    review = Review(
        customer_id=current_user.id,
        food_id=data.food_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate cook rating
    cook = db.query(HomeCook).filter(HomeCook.id == food.cook_id).first()
    if cook:
        stats = (
            db.query(func.avg(Review.rating), func.count(Review.id))
            .join(Food, Food.id == Review.food_id)
            .filter(Food.cook_id == cook.id)
            .first()
        )
        if stats and stats[0] is not None:
            cook.rating = round(float(stats[0]), 1)
            cook.total_reviews = int(stats[1])
            db.commit()

        if cook.user_id:
            create_notification(
                db,
                user_id=cook.user_id,
                title="⭐ New Customer Review!",
                message=f"Received a {data.rating}-star review for '{food.name}': {data.comment or 'Great taste!'}",
                notif_type="REVIEW",
            )

    res = ReviewOut.model_validate(review)
    res.customer_name = current_user.name
    return res

@router.get("/food/{food_id}", response_model=List[ReviewOut])
def get_food_reviews(food_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.food_id == food_id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        item = ReviewOut.model_validate(r)
        item.customer_name = r.customer.name if r.customer else "Anonymous Foodie"
        results.append(item)
    return results

@router.get("/cook/{cook_id}", response_model=List[ReviewOut])
def get_cook_reviews(cook_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .join(Food, Food.id == Review.food_id)
        .filter(Food.cook_id == cook_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    results = []
    for r in reviews:
        item = ReviewOut.model_validate(r)
        item.customer_name = r.customer.name if r.customer else "Anonymous Foodie"
        results.append(item)
    return results
