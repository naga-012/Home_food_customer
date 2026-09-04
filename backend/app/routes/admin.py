import math
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.food import Food
from app.models.cook import HomeCook
from app.models.audit_log import AdminAuditLog
from app.schemas.auth import LoginRequest, Token
from app.schemas.admin import (
    AdminOrderOut,
    PaginatedOrdersOut,
    OrderStatusUpdateAdmin,
    OrderRejectRequest,
    CustomerListItemOut,
    CustomerDetailOut,
    CookAdminOut,
    FoodAdminOut,
    FoodCreateAdmin,
    FoodStatusUpdate,
    CategoryStatOut,
    AuditLogOut,
)
from app.utils.security import verify_password, create_access_token
from app.utils.dependencies import require_admin
from app.services.notification_service import create_notification

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

# --- AUTHENTICATION ---
@router.post("/login", response_model=Token)
def admin_login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    if user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin credentials required. Customers cannot access admin portal.",
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is inactive.")

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})

    # Log login action in audit log
    log = AdminAuditLog(
        admin_id=user.id,
        admin_email=user.email,
        action="ADMIN_LOGIN",
        details="Admin logged in successfully",
    )
    db.add(log)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
            "city": user.city,
        },
    }

# --- DASHBOARD METRICS ---
@router.get("/dashboard")
def get_admin_dashboard(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Total counts calculated directly from SQLite database
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.order_status == "PENDING").scalar() or 0
    accepted_orders = db.query(func.count(Order.id)).filter(Order.order_status == "ACCEPTED").scalar() or 0
    preparing_orders = db.query(func.count(Order.id)).filter(Order.order_status == "PREPARING").scalar() or 0
    out_for_delivery = db.query(func.count(Order.id)).filter(Order.order_status == "OUT_FOR_DELIVERY").scalar() or 0
    delivered_orders = db.query(func.count(Order.id)).filter(Order.order_status == "DELIVERED").scalar() or 0
    cancelled_orders = db.query(func.count(Order.id)).filter(Order.order_status == "CANCELLED").scalar() or 0
    rejected_orders = db.query(func.count(Order.id)).filter(Order.order_status == "REJECTED").scalar() or 0

    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.order_status.in_(["DELIVERED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"])
    ).scalar() or 0.0

    # Today's Revenue
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= today_start,
        Order.order_status.in_(["DELIVERED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"])
    ).scalar() or 0.0

    total_customers = db.query(func.count(User.id)).filter(User.role == "CUSTOMER").scalar() or 0
    total_cooks = db.query(func.count(HomeCook.id)).scalar() or 0
    total_foods = db.query(func.count(Food.id)).scalar() or 0

    # Recent 6 orders
    recent_orders_raw = db.query(Order).order_by(Order.created_at.desc()).limit(6).all()
    recent_orders = []
    for o in recent_orders_raw:
        recent_orders.append({
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.customer.name if o.customer else "Unknown",
            "customer_phone": o.phone,
            "delivery_address": o.delivery_address,
            "city": o.city,
            "pincode": o.pincode,
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "created_at": o.created_at.isoformat(),
            "items_count": len(o.items),
        })

    return {
        "statistics": {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "accepted_orders": accepted_orders,
            "preparing_orders": preparing_orders,
            "out_for_delivery_orders": out_for_delivery,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "rejected_orders": rejected_orders,
            "today_revenue": round(float(today_revenue), 2),
            "total_revenue": round(float(total_revenue), 2),
            "total_customers": total_customers,
            "total_cooks": total_cooks,
            "total_foods": total_foods,
        },
        "recent_orders": recent_orders,
    }

# --- ORDERS MANAGEMENT ---
@router.get("/orders", response_model=PaginatedOrdersOut)
def list_admin_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    date_filter: Optional[str] = None,  # today, yesterday, 7days, 30days
    sort_by: Optional[str] = "newest",  # newest, oldest, highest_amount, lowest_amount
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Order).join(User, Order.customer_id == User.id, isouter=True)

    if status and status.upper() != "ALL":
        query = query.filter(Order.order_status == status.upper())

    if payment_status and payment_status.upper() != "ALL":
        query = query.filter(Order.payment_status == payment_status.upper())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search_term),
                Order.phone.ilike(search_term),
                User.name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    # Date filters
    now = datetime.utcnow()
    if date_filter == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(Order.created_at >= start)
    elif date_filter == "yesterday":
        start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(Order.created_at >= start, Order.created_at < end)
    elif date_filter == "7days":
        start = now - timedelta(days=7)
        query = query.filter(Order.created_at >= start)
    elif date_filter == "30days":
        start = now - timedelta(days=30)
        query = query.filter(Order.created_at >= start)

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Order.created_at))
    elif sort_by == "highest_amount":
        query = query.order_by(desc(Order.total_amount))
    elif sort_by == "lowest_amount":
        query = query.order_by(asc(Order.total_amount))
    else:
        query = query.order_by(desc(Order.created_at))

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()

    return {
        "items": orders,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }

@router.get("/orders/{id}", response_model=AdminOrderOut)
def get_admin_order_details(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order #{id} not found")
    return order

@router.post("/orders/{id}/accept", response_model=AdminOrderOut)
def accept_order(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).with_for_update().first() if hasattr(Order, "__table__") else db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.order_status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot accept order. Current status is already '{order.order_status}'.",
        )

    old_status = order.order_status
    order.order_status = "ACCEPTED"
    db.commit()
    db.refresh(order)

    # Audit log
    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="ORDER_ACCEPTED",
        order_id=order.id,
        order_number=order.order_number,
        old_status=old_status,
        new_status="ACCEPTED",
        details="Admin accepted the pending order",
    )
    db.add(audit)

    # Notify customer
    create_notification(
        db,
        user_id=order.customer_id,
        title=f"Order Accepted! #{order.order_number}",
        message="Your order has been accepted by Inti Ruchi kitchen and is queued for preparation!",
        notif_type="ORDER",
    )
    db.commit()

    return order

@router.post("/orders/{id}/reject", response_model=AdminOrderOut)
def reject_order(
    id: int,
    data: OrderRejectRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.order_status in ["DELIVERED", "REJECTED", "CANCELLED"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot reject order. Current status is already '{order.order_status}'.",
        )

    old_status = order.order_status
    order.order_status = "REJECTED"
    order.rejection_reason = data.reason.strip() or "Food unavailable"
    db.commit()
    db.refresh(order)

    # Audit log
    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="ORDER_REJECTED",
        order_id=order.id,
        order_number=order.order_number,
        old_status=old_status,
        new_status="REJECTED",
        details=f"Reason: {order.rejection_reason}",
    )
    db.add(audit)

    # Notify customer
    create_notification(
        db,
        user_id=order.customer_id,
        title=f"Order Update #{order.order_number}",
        message=f"Sorry, your order #{order.order_number} has been rejected. Reason: {order.rejection_reason}",
        notif_type="ORDER",
    )
    db.commit()

    return order

@router.patch("/orders/{id}/status", response_model=AdminOrderOut)
def update_order_status_admin(
    id: int,
    data: OrderStatusUpdateAdmin,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REJECTED"]
    new_status = data.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid order status '{new_status}'")

    old_status = order.order_status
    order.order_status = new_status

    if data.payment_status:
        order.payment_status = data.payment_status.upper()
    elif new_status == "DELIVERED" and order.payment_method == "COD":
        order.payment_status = "PAID"

    if data.rejection_reason:
        order.rejection_reason = data.rejection_reason

    db.commit()
    db.refresh(order)

    # Audit log
    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="ORDER_STATUS_UPDATE",
        order_id=order.id,
        order_number=order.order_number,
        old_status=old_status,
        new_status=new_status,
        details=f"Status changed from {old_status} to {new_status}",
    )
    db.add(audit)

    # Notify customer
    status_msg_map = {
        "ACCEPTED": "has been accepted by Inti Ruchi!",
        "PREPARING": "is now being freshly cooked by the chef!",
        "OUT_FOR_DELIVERY": "is on its way with our delivery partner!",
        "DELIVERED": "has been safely delivered. Enjoy your homemade meal!",
        "CANCELLED": "has been cancelled.",
        "REJECTED": f"was rejected. Reason: {order.rejection_reason or 'Order unavailable'}",
    }
    action_text = status_msg_map.get(new_status, f"status is now {new_status}")

    create_notification(
        db,
        user_id=order.customer_id,
        title=f"Order Update #{order.order_number}",
        message=f"Your order #{order.order_number} {action_text}",
        notif_type="ORDER",
    )
    db.commit()

    return order

# --- CUSTOMER MANAGEMENT ---
@router.get("/customers", response_model=List[CustomerListItemOut])
def list_customers(
    search: Optional[str] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.role == "CUSTOMER")
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(s), User.email.ilike(s), User.phone.ilike(s)))

    customers = query.order_by(desc(User.created_at)).all()
    results = []
    for c in customers:
        order_stats = db.query(
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("total_spending"),
            func.max(Order.created_at).label("last_order_date"),
        ).filter(Order.customer_id == c.id).first()

        results.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "address": c.address,
            "city": c.city,
            "is_active": c.is_active,
            "created_at": c.created_at,
            "total_orders": order_stats.total_orders or 0,
            "total_spending": round(float(order_stats.total_spending or 0.0), 2),
            "last_order_date": order_stats.last_order_date,
        })

    return results

@router.get("/customers/{id}", response_model=CustomerDetailOut)
def get_customer_details(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    c = db.query(User).filter(User.id == id, User.role == "CUSTOMER").first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_orders = db.query(func.count(Order.id)).filter(Order.customer_id == c.id).scalar() or 0
    completed_orders = db.query(func.count(Order.id)).filter(Order.customer_id == c.id, Order.order_status == "DELIVERED").scalar() or 0
    cancelled_orders = db.query(func.count(Order.id)).filter(Order.customer_id == c.id, Order.order_status.in_(["CANCELLED", "REJECTED"])).scalar() or 0
    total_spending = db.query(func.sum(Order.total_amount)).filter(Order.customer_id == c.id, Order.order_status.in_(["DELIVERED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"])).scalar() or 0.0

    recent_orders = db.query(Order).filter(Order.customer_id == c.id).order_by(desc(Order.created_at)).limit(20).all()

    customer_address = c.address
    customer_city = c.city
    customer_pincode = c.pincode
    if not customer_address and recent_orders:
        for ord in recent_orders:
            if ord.delivery_address:
                customer_address = ord.delivery_address
                customer_city = ord.city or customer_city
                customer_pincode = ord.pincode or customer_pincode
                break

    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "address": customer_address,
        "city": customer_city,
        "pincode": customer_pincode,
        "is_active": c.is_active,
        "created_at": c.created_at,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "total_spending": round(float(total_spending), 2),
        "recent_orders": recent_orders,
    }

@router.patch("/customers/{id}/status")
def toggle_customer_status(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    c = db.query(User).filter(User.id == id, User.role == "CUSTOMER").first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")

    c.is_active = not c.is_active
    db.commit()

    action = "CUSTOMER_UNBLOCKED" if c.is_active else "CUSTOMER_BLOCKED"
    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action=action,
        details=f"Customer {c.name} ({c.email}) status set to is_active={c.is_active}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Customer {'unblocked' if c.is_active else 'blocked'} successfully", "is_active": c.is_active}

# --- FOODS MANAGEMENT ---
@router.get("/foods", response_model=List[FoodAdminOut])
def list_admin_foods(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Food).join(HomeCook, Food.cook_id == HomeCook.id)
    if category and category.upper() != "ALL":
        query = query.filter(Food.category == category)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(Food.name.ilike(s), Food.description.ilike(s)))

    foods = query.order_by(desc(Food.created_at)).all()
    results = []
    for f in foods:
        results.append({
            "id": f.id,
            "cook_id": f.cook_id,
            "cook_name": f.cook.user.name if f.cook and f.cook.user else "Chef",
            "kitchen_name": f.cook.kitchen_name if f.cook else "Home Kitchen",
            "name": f.name,
            "description": f.description,
            "category": f.category,
            "price": f.price,
            "discount_price": f.discount_price,
            "is_evening_offer": f.is_evening_offer,
            "quantity": f.quantity,
            "food_type": f.food_type,
            "preparation_time": f.preparation_time,
            "is_available": f.is_available,
            "is_today_menu": f.is_today_menu,
            "image_url": f.image_url,
            "created_at": f.created_at,
        })
    return results


@router.post("/foods", response_model=FoodAdminOut)
def create_food_admin(
    data: FoodCreateAdmin,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Verify cook exists
    cook = db.query(HomeCook).filter(HomeCook.id == data.cook_id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Selected cook/kitchen not found")

    new_food = Food(
        cook_id=data.cook_id,
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        category=data.category.strip(),
        price=float(data.price),
        discount_price=float(data.discount_price) if data.discount_price is not None else None,
        is_evening_offer=bool(data.is_evening_offer),
        quantity=int(data.quantity) if data.quantity else 10,
        food_type=data.food_type.upper(),
        preparation_time=data.preparation_time or "30 mins",
        is_available=bool(data.is_available),
        is_today_menu=bool(data.is_today_menu),
        image_url=data.image_url,
    )
    db.add(new_food)
    db.commit()
    db.refresh(new_food)

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="FOOD_CREATED",
        details=f"Created food '{new_food.name}' (Rs. {new_food.price}) in category '{new_food.category}' for kitchen '{cook.kitchen_name}'",
    )
    db.add(audit)
    db.commit()

    return {
        "id": new_food.id,
        "cook_id": new_food.cook_id,
        "cook_name": cook.user.name if cook.user else "Chef",
        "kitchen_name": cook.kitchen_name,
        "name": new_food.name,
        "description": new_food.description,
        "category": new_food.category,
        "price": new_food.price,
        "discount_price": new_food.discount_price,
        "is_evening_offer": new_food.is_evening_offer,
        "quantity": new_food.quantity,
        "food_type": new_food.food_type,
        "preparation_time": new_food.preparation_time,
        "is_available": new_food.is_available,
        "is_today_menu": new_food.is_today_menu,
        "image_url": new_food.image_url,
        "created_at": new_food.created_at,
    }

@router.patch("/foods/{id}/status")
def toggle_food_status(
    id: int,
    data: FoodStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if data.is_available is not None:
        food.is_available = data.is_available
    if data.is_today_menu is not None:
        food.is_today_menu = data.is_today_menu
    if data.price is not None:
        food.price = data.price

    db.commit()
    db.refresh(food)

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="FOOD_STATUS_UPDATED",
        details=f"Food item {food.name} availability={food.is_available}, price={food.price}",
    )
    db.add(audit)
    db.commit()

    return {"message": "Food item updated successfully", "is_available": food.is_available}

@router.delete("/foods/{id}")
def delete_food_admin(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    food_name = food.name
    db.delete(food)
    db.commit()

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="FOOD_DELETED",
        details=f"Deleted food: {food_name}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Food '{food_name}' deleted successfully"}

# --- CATEGORIES MANAGEMENT ---
@router.get("/categories", response_model=List[CategoryStatOut])
def get_categories_admin(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    categories = db.query(
        Food.category,
        func.count(Food.id).label("count")
    ).group_by(Food.category).all()

    return [{"name": cat[0], "food_count": cat[1], "is_active": True} for cat in categories]

# --- HOME COOKS MANAGEMENT ---
@router.get("/cooks", response_model=List[CookAdminOut])
def list_cooks_admin(
    status_filter: Optional[str] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(HomeCook).join(User, HomeCook.user_id == User.id)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(HomeCook.approval_status == status_filter.upper())

    cooks = query.all()
    results = []
    for c in cooks:
        order_count = db.query(func.count(Order.id)).filter(Order.cook_id == c.id).scalar() or 0
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "name": c.user.name if c.user else "Chef",
            "email": c.user.email if c.user else "",
            "phone": c.user.phone if c.user else None,
            "kitchen_name": c.kitchen_name,
            "description": c.description,
            "specialization": c.specialization,
            "approval_status": c.approval_status,
            "rating": c.rating,
            "total_reviews": c.total_reviews,
            "total_orders": order_count,
            "banner_image": c.banner_image,
        })
    return results

@router.patch("/cooks/{id}/approve")
def approve_cook(id: int, current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    cook = db.query(HomeCook).filter(HomeCook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")
    cook.approval_status = "APPROVED"
    db.commit()

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="COOK_APPROVED",
        details=f"Home cook kitchen '{cook.kitchen_name}' approved",
    )
    db.add(audit)
    db.commit()
    return {"message": "Home cook approved successfully", "approval_status": cook.approval_status}

@router.patch("/cooks/{id}/reject")
def reject_cook(id: int, current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    cook = db.query(HomeCook).filter(HomeCook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")
    cook.approval_status = "REJECTED"
    db.commit()

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="COOK_REJECTED",
        details=f"Home cook kitchen '{cook.kitchen_name}' rejected",
    )
    db.add(audit)
    db.commit()
    return {"message": "Home cook rejected", "approval_status": cook.approval_status}

@router.patch("/cooks/{id}/suspend")
def suspend_cook(id: int, current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    cook = db.query(HomeCook).filter(HomeCook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")
    cook.approval_status = "SUSPENDED"
    db.commit()

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action="COOK_SUSPENDED",
        details=f"Home cook kitchen '{cook.kitchen_name}' suspended",
    )
    db.add(audit)
    db.commit()
    return {"message": "Home cook suspended", "approval_status": cook.approval_status}

# --- REPORTS & ANALYTICS ---
@router.get("/reports/revenue")
def get_revenue_report(current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    delivered_statuses = ["DELIVERED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"]

    today_rev = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= today_start,
        Order.order_status.in_(delivered_statuses)
    ).scalar() or 0.0

    week_rev = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= week_start,
        Order.order_status.in_(delivered_statuses)
    ).scalar() or 0.0

    month_rev = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= month_start,
        Order.order_status.in_(delivered_statuses)
    ).scalar() or 0.0

    total_rev = db.query(func.sum(Order.total_amount)).filter(
        Order.order_status.in_(delivered_statuses)
    ).scalar() or 0.0

    # 7-day revenue trend
    trend = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        day_revenue = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end,
            Order.order_status.in_(delivered_statuses)
        ).scalar() or 0.0
        trend.append({"date": day_date.strftime("%b %d"), "revenue": round(float(day_revenue), 2)})

    return {
        "today_revenue": round(float(today_rev), 2),
        "weekly_revenue": round(float(week_rev), 2),
        "monthly_revenue": round(float(month_rev), 2),
        "total_revenue": round(float(total_rev), 2),
        "daily_revenue_trend": trend,
    }

@router.get("/reports/orders")
def get_orders_report(current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    status_counts = db.query(Order.order_status, func.count(Order.id)).group_by(Order.order_status).all()
    distribution = {s[0]: s[1] for s in status_counts}

    # 7-day orders trend
    now = datetime.utcnow()
    orders_trend = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        day_count = db.query(func.count(Order.id)).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).scalar() or 0
        orders_trend.append({"date": day_date.strftime("%b %d"), "count": day_count})

    # Top popular food items
    popular_foods_raw = db.query(
        OrderItem.food_name,
        func.sum(OrderItem.quantity).label("total_qty"),
        func.sum(OrderItem.quantity * OrderItem.price).label("total_sales")
    ).group_by(OrderItem.food_name).order_by(desc("total_qty")).limit(5).all()

    popular_foods = [
        {"name": item[0], "orders": int(item[1] or 0), "sales": round(float(item[2] or 0), 2)}
        for item in popular_foods_raw
    ]

    # Popular categories
    popular_cat_raw = db.query(
        Food.category,
        func.count(Order.id).label("order_count")
    ).join(OrderItem, OrderItem.food_id == Food.id).join(Order, Order.id == OrderItem.order_id).group_by(Food.category).all()

    popular_categories = [{"category": c[0], "orders": c[1]} for c in popular_cat_raw]

    return {
        "total_orders": total_orders,
        "status_distribution": distribution,
        "daily_orders_trend": orders_trend,
        "popular_foods": popular_foods,
        "popular_categories": popular_categories,
    }

# --- NOTIFICATIONS & AUDIT LOGS ---
@router.get("/notifications")
def get_admin_notifications(current_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    # Combine pending orders, new registrations, and recent cancellations
    notifications = []
    
    pending_orders = db.query(Order).filter(Order.order_status == "PENDING").order_by(desc(Order.created_at)).limit(10).all()
    for po in pending_orders:
        notifications.append({
            "id": f"ord-{po.id}",
            "title": "New Order Pending!",
            "message": f"Order #{po.order_number} of ₹{po.total_amount:.0f} is awaiting admin approval.",
            "type": "NEW_ORDER",
            "order_id": po.id,
            "order_number": po.order_number,
            "created_at": po.created_at.isoformat(),
        })

    pending_cooks = db.query(HomeCook).filter(HomeCook.approval_status == "PENDING").all()
    for pc in pending_cooks:
        notifications.append({
            "id": f"cook-{pc.id}",
            "title": "Home Cook Registration",
            "message": f"Kitchen '{pc.kitchen_name}' requires profile verification.",
            "type": "COOK_VERIFICATION",
            "cook_id": pc.id,
            "created_at": datetime.utcnow().isoformat(),
        })

    return notifications

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(AdminAuditLog).order_by(desc(AdminAuditLog.created_at)).limit(limit).all()
