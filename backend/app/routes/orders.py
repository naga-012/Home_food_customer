import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.food import Food
from app.models.cook import HomeCook
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderOut
from app.utils.dependencies import get_current_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    subtotal = 0.0
    order_items_data = []
    primary_cook_id = data.cook_id

    for item in cart.items:
        food = item.food
        if not food or not food.is_available:
            raise HTTPException(status_code=400, detail=f"Item '{food.name if food else 'Unknown'}' is no longer available")
        
        if food.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Only {food.quantity} left for '{food.name}'")

        price = food.discount_price if (food.is_evening_offer and food.discount_price) else food.price
        subtotal += price * item.quantity
        
        if not primary_cook_id:
            primary_cook_id = food.cook_id

        # Deduct quantity
        food.quantity -= item.quantity
        if food.quantity <= 0:
            food.is_available = False

        order_items_data.append({
            "food_id": food.id,
            "food_name": food.name,
            "quantity": item.quantity,
            "price": price,
        })

    delivery_fee = 35.0
    total_amount = subtotal + delivery_fee
    order_num = f"IR-{uuid.uuid4().hex[:8].upper()}"

    payment_status = "PAID" if data.payment_method in ["UPI", "CARD"] else "PENDING"

    order = Order(
        order_number=order_num,
        customer_id=current_user.id,
        cook_id=primary_cook_id,
        subtotal=round(subtotal, 2),
        delivery_fee=delivery_fee,
        total_amount=round(total_amount, 2),
        delivery_address=data.delivery_address,
        city=data.city or current_user.city or "Hyderabad",
        pincode=data.pincode or current_user.pincode or "500001",
        phone=data.phone or current_user.phone or "9876543210",
        payment_method=data.payment_method,
        payment_status=payment_status,
        order_status="PENDING",
        special_instructions=data.special_instructions,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item_data in order_items_data:
        oi = OrderItem(
            order_id=order.id,
            food_id=item_data["food_id"],
            food_name=item_data["food_name"],
            quantity=item_data["quantity"],
            price=item_data["price"],
        )
        db.add(oi)

    # Empty user cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(order)

    # In-app notifications
    create_notification(
        db,
        user_id=current_user.id,
        title="🎉 Order Placed Successfully!",
        message=f"Your order #{order.order_number} of ₹{order.total_amount:.0f} has been placed. The home chef is reviewing it!",
        notif_type="ORDER",
    )

    if primary_cook_id:
        cook = db.query(HomeCook).filter(HomeCook.id == primary_cook_id).first()
        if cook and cook.user_id:
            create_notification(
                db,
                user_id=cook.user_id,
                title="🔔 New Order Received!",
                message=f"New order #{order.order_number} received for ₹{order.total_amount:.0f}. Please review and accept.",
                notif_type="ORDER",
            )

    return order

@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Order)

    if current_user.role == "HOME_COOK" and current_user.cook_profile:
        query = query.filter(Order.cook_id == current_user.cook_profile.id)
    else:
        # Customer
        query = query.filter(Order.customer_id == current_user.id)

    if status:
        query = query.filter(Order.order_status == status)

    return query.order_by(Order.created_at.desc()).all()

@router.get("/{id}", response_model=OrderOut)
def get_order(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check permission
    is_owner = order.customer_id == current_user.id
    is_cook = current_user.cook_profile and order.cook_id == current_user.cook_profile.id

    if not (is_owner or is_cook):
        raise HTTPException(status_code=403, detail="Access denied")

    return order

@router.put("/{id}/status", response_model=OrderOut)
def update_order_status(
    id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    is_cook = current_user.cook_profile and order.cook_id == current_user.cook_profile.id

    if not is_cook:
        raise HTTPException(status_code=403, detail="Not authorized to update this order's status")

    order.order_status = data.order_status
    if data.payment_status:
        order.payment_status = data.payment_status
    elif data.order_status == "DELIVERED" and order.payment_method == "COD":
        order.payment_status = "PAID"

    db.commit()
    db.refresh(order)

    # Customer notification
    status_msg_map = {
        "ACCEPTED": "has been accepted by the chef!",
        "PREPARING": "is now being freshly cooked!",
        "OUT_FOR_DELIVERY": "is on the way to your door!",
        "DELIVERED": "has been safely delivered. Enjoy your meal!",
        "CANCELLED": "was cancelled.",
    }
    action_text = status_msg_map.get(order.order_status, f"status changed to {order.order_status}")

    create_notification(
        db,
        user_id=order.customer_id,
        title=f"📦 Order Update #{order.order_number}",
        message=f"Your order #{order.order_number} {action_text}",
        notif_type="ORDER",
    )

    return order
