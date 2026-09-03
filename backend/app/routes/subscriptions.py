from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionStatusUpdate, SubscriptionOut
from app.utils.dependencies import get_current_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/api/subscriptions", tags=["Meal Subscriptions"])

@router.post("", response_model=SubscriptionOut)
def create_subscription(
    data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = Subscription(
        customer_id=current_user.id,
        cook_id=data.cook_id,
        plan_name=data.plan_name,
        plan_type=data.plan_type,
        start_date=data.start_date,
        delivery_time=data.delivery_time,
        delivery_address=data.delivery_address,
        price=data.price,
        status="ACTIVE",
        notes=data.notes,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    create_notification(
        db,
        user_id=current_user.id,
        title="🥗 Subscription Activated!",
        message=f"Your {data.plan_name} meal subscription has been activated starting {data.start_date}.",
        notif_type="SYSTEM",
    )

    return sub

@router.get("", response_model=List[SubscriptionOut])
def get_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Subscription).filter(Subscription.customer_id == current_user.id).order_by(Subscription.created_at.desc()).all()

@router.put("/{id}/status", response_model=SubscriptionOut)
def update_subscription_status(
    id: int,
    data: SubscriptionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    sub.status = data.status
    db.commit()
    db.refresh(sub)

    create_notification(
        db,
        user_id=sub.customer_id,
        title=f"Meal Plan {sub.status.capitalize()}",
        message=f"Your subscription '{sub.plan_name}' has been updated to {sub.status}.",
        notif_type="SYSTEM",
    )

    return sub

@router.delete("/{id}")
def cancel_subscription(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    sub.status = "CANCELLED"
    db.commit()
    return {"message": "Subscription cancelled successfully"}
