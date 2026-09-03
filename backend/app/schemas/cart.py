from typing import List, Optional
from pydantic import BaseModel
from app.schemas.food import FoodOut

class CartItemAdd(BaseModel):
    food_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    id: int
    food_id: int
    quantity: int
    food: FoodOut

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    customer_id: int
    items: List[CartItemOut] = []
    subtotal: float = 0.0
    delivery_fee: float = 30.0
    total_amount: float = 0.0

    class Config:
        from_attributes = True
