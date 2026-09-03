from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.food import Food
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

def calculate_cart_response(cart: Cart) -> dict:
    items_out = []
    subtotal = 0.0
    
    for item in cart.items:
        if item.food:
            effective_price = item.food.discount_price if (item.food.is_evening_offer and item.food.discount_price) else item.food.price
            subtotal += effective_price * item.quantity
            items_out.append(item)

    delivery_fee = 35.0 if subtotal > 0 else 0.0
    total = subtotal + delivery_fee

    return {
        "id": cart.id,
        "customer_id": cart.customer_id,
        "items": items_out,
        "subtotal": round(subtotal, 2),
        "delivery_fee": round(delivery_fee, 2),
        "total_amount": round(total, 2),
    }

@router.get("", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart:
        cart = Cart(customer_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return calculate_cart_response(cart)

@router.post("/add", response_model=CartOut)
def add_to_cart(
    data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    food = db.query(Food).filter(Food.id == data.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    if not food.is_available or food.quantity <= 0:
        raise HTTPException(status_code=400, detail="Food item is currently sold out")

    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart:
        cart = Cart(customer_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    existing_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.food_id == data.food_id).first()
    if existing_item:
        existing_item.quantity += data.quantity
    else:
        new_item = CartItem(cart_id=cart.id, food_id=data.food_id, quantity=data.quantity)
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return calculate_cart_response(cart)

@router.put("/update", response_model=CartOut)
def update_cart_item(
    cart_item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if data.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = data.quantity

    db.commit()
    db.refresh(cart)
    return calculate_cart_response(cart)

@router.delete("/remove/{id}", response_model=CartOut)
def remove_from_cart(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(CartItem).filter(CartItem.id == id, CartItem.cart_id == cart.id).first()
    if item:
        db.delete(item)
        db.commit()
        db.refresh(cart)

    return calculate_cart_response(cart)

@router.delete("/clear")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared successfully"}
