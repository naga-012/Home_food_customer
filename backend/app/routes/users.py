from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.models.favorite import Favorite
from app.models.subscription import Subscription
from app.models.food import Food
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/dashboard")
def get_customer_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_orders = db.query(Order).filter(Order.customer_id == current_user.id).count()
    active_orders = (
        db.query(Order)
        .filter(
            Order.customer_id == current_user.id,
            Order.order_status.in_(["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"]),
        )
        .count()
    )
    completed_orders = (
        db.query(Order)
        .filter(Order.customer_id == current_user.id, Order.order_status == "DELIVERED")
        .count()
    )
    favorites_count = db.query(Favorite).filter(Favorite.customer_id == current_user.id).count()
    active_subscriptions = (
        db.query(Subscription)
        .filter(Subscription.customer_id == current_user.id, Subscription.status == "ACTIVE")
        .count()
    )

    recent_orders = (
        db.query(Order)
        .filter(Order.customer_id == current_user.id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    # Favorite food details
    fav_food_ids = [
        f.food_id for f in db.query(Favorite.food_id).filter(Favorite.customer_id == current_user.id).limit(4).all()
    ]
    favorite_foods = db.query(Food).filter(Food.id.in_(fav_food_ids)).all() if fav_food_ids else []

    # Active subscription details
    sub = (
        db.query(Subscription)
        .filter(Subscription.customer_id == current_user.id, Subscription.status == "ACTIVE")
        .first()
    )

    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "city": current_user.city,
            "address": current_user.address,
        },
        "total_orders": total_orders,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "favorites_count": favorites_count,
        "total_favorites": favorites_count,
        "active_subscriptions_count": active_subscriptions,
        "active_subscription": sub,
        "recent_orders": recent_orders,
        "favorite_foods": favorite_foods,
    }
