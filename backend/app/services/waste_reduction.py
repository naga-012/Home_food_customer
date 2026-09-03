from typing import List
from sqlalchemy.orm import Session
from app.models.food import Food
from app.models.user import User
from app.models.notification import Notification

def apply_evening_discount(
    db: Session,
    food_id: int,
    discount_price: float,
    available_qty: int
) -> Food:
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        return None
    
    food.discount_price = discount_price
    food.is_evening_offer = True
    food.quantity = available_qty
    db.commit()
    db.refresh(food)

    # Notify all active customers about evening waste reduction deal
    customers = db.query(User).filter(User.role == "CUSTOMER", User.is_active == True).all()
    notifications = []
    discount_pct = int(((food.price - discount_price) / food.price) * 100) if food.price > 0 else 0
    
    for customer in customers:
        notifications.append(
            Notification(
                user_id=customer.id,
                title="🔥 Evening Flash Offer: Reduced Price Food!",
                message=f"Special Evening Offer: Enjoy {food.name} at ₹{discount_price:.0f} ({discount_pct}% off). Fresh homemade food, limited quantity left!",
                type="DISCOUNT",
            )
        )
    if notifications:
        db.bulk_save_objects(notifications)
        db.commit()

    return food

def remove_evening_discount(db: Session, food_id: int) -> Food:
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        return None
    food.discount_price = None
    food.is_evening_offer = False
    db.commit()
    db.refresh(food)
    return food

def get_active_waste_reduction_offers(db: Session) -> List[Food]:
    return (
        db.query(Food)
        .filter(Food.is_evening_offer == True, Food.is_available == True, Food.quantity > 0)
        .all()
    )
