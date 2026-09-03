from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class OrderItemOut(BaseModel):
    id: int
    food_id: Optional[int] = None
    food_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    delivery_address: str
    city: Optional[str] = "Hyderabad"
    pincode: Optional[str] = "500001"
    phone: str
    payment_method: str = "COD"  # COD, UPI, CARD
    special_instructions: Optional[str] = None
    cook_id: Optional[int] = None

class OrderStatusUpdate(BaseModel):
    order_status: str  # PENDING, ACCEPTED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    payment_status: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_id: int
    cook_id: Optional[int] = None
    subtotal: float
    delivery_fee: float
    total_amount: float
    delivery_address: str
    city: Optional[str] = None
    pincode: Optional[str] = None
    phone: str
    payment_method: str
    payment_status: str
    order_status: str
    special_instructions: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
