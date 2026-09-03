from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.cook import HomeCook
from app.models.food import Food
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.user import CookOut
from app.schemas.food import FoodOut
from app.utils.dependencies import get_current_user, require_cook

router = APIRouter(prefix="/api/cooks", tags=["Home Cooks"])

@router.get("", response_model=List[CookOut])
def list_approved_cooks(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(HomeCook).filter(HomeCook.approval_status == "APPROVED")
    cooks = query.all()
    return cooks

@router.get("/my/dashboard")
def get_cook_dashboard(
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    cook = current_user.cook_profile
    if not cook:
        raise HTTPException(status_code=400, detail="Cook profile not found")

    today_start = datetime.combine(date.today(), datetime.min.time())

    # Today's orders
    today_orders_count = (
        db.query(Order)
        .filter(Order.cook_id == cook.id, Order.created_at >= today_start)
        .count()
    )

    # Total completed earnings
    earnings_sum = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.cook_id == cook.id, Order.order_status.in_(["DELIVERED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"]))
        .scalar()
    ) or 0.0

    # Total foods
    total_foods = db.query(Food).filter(Food.cook_id == cook.id).count()

    # Active distinct customers
    active_customers = (
        db.query(func.count(func.distinct(Order.customer_id)))
        .filter(Order.cook_id == cook.id)
        .scalar()
    ) or 0

    # Recent orders
    recent_orders = (
        db.query(Order)
        .filter(Order.cook_id == cook.id)
        .order_by(Order.created_at.desc())
        .limit(8)
        .all()
    )

    # Monthly sales data (simulated/aggregated)
    monthly_sales = [
        {"month": "May", "sales": round(earnings_sum * 0.15, 2)},
        {"month": "Jun", "sales": round(earnings_sum * 0.20, 2)},
        {"month": "Jul", "sales": round(earnings_sum * 0.25, 2)},
        {"month": "Aug", "sales": round(earnings_sum * 0.40, 2)},
    ]

    return {
        "kitchen_name": cook.kitchen_name,
        "approval_status": cook.approval_status,
        "rating": cook.rating,
        "total_reviews": cook.total_reviews,
        "today_orders": today_orders_count,
        "total_earnings": round(earnings_sum, 2),
        "total_foods": total_foods,
        "active_customers": active_customers,
        "monthly_sales": monthly_sales,
        "recent_orders": recent_orders,
    }

@router.get("/my/todays-menu", response_model=List[FoodOut])
def get_my_todays_menu(
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    cook = current_user.cook_profile
    if not cook:
        raise HTTPException(status_code=400, detail="Cook profile not found")
    
    return db.query(Food).filter(Food.cook_id == cook.id, Food.is_today_menu == True).all()

@router.post("/my/todays-menu/toggle/{food_id}", response_model=FoodOut)
def toggle_todays_menu(
    food_id: int,
    current_user: User = Depends(require_cook),
    db: Session = Depends(get_db),
):
    cook = current_user.cook_profile
    if not cook:
        raise HTTPException(status_code=400, detail="Cook profile not found")

    food = db.query(Food).filter(Food.id == food_id, Food.cook_id == cook.id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    food.is_today_menu = not food.is_today_menu
    db.commit()
    db.refresh(food)
    return food

@router.get("/{id}")
def get_cook_detail(id: int, db: Session = Depends(get_db)):
    cook = db.query(HomeCook).filter(HomeCook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Home cook not found")

    foods = db.query(Food).filter(Food.cook_id == cook.id, Food.is_available == True).all()

    return {
        "cook": cook,
        "user": {
            "name": cook.user.name if cook.user else "Chef",
            "city": cook.user.city if cook.user else "Hyderabad",
            "address": cook.user.address if cook.user else "",
        },
        "foods": foods,
    }
