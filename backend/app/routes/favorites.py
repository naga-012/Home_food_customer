from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.favorite import Favorite
from app.models.food import Food
from app.models.user import User
from app.schemas.food import FoodOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

@router.get("", response_model=List[FoodOut])
def get_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favorites = db.query(Favorite).filter(Favorite.customer_id == current_user.id).all()
    food_ids = [fav.food_id for fav in favorites]
    if not food_ids:
        return []
    foods = db.query(Food).filter(Food.id.in_(food_ids)).all()
    return foods

@router.post("/{food_id}")
def add_favorite(food_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    existing = db.query(Favorite).filter(Favorite.customer_id == current_user.id, Favorite.food_id == food_id).first()
    if not existing:
        fav = Favorite(customer_id=current_user.id, food_id=food_id)
        db.add(fav)
        db.commit()
    return {"message": "Added to favorites"}

@router.delete("/{food_id}")
def remove_favorite(food_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fav = db.query(Favorite).filter(Favorite.customer_id == current_user.id, Favorite.food_id == food_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"message": "Removed from favorites"}

@router.get("/check/{food_id}")
def check_favorite(food_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fav = db.query(Favorite).filter(Favorite.customer_id == current_user.id, Favorite.food_id == food_id).first()
    return {"is_favorite": fav is not None}
