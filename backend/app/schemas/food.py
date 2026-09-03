from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class FoodBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    discount_price: Optional[float] = None
    is_evening_offer: bool = False
    quantity: int = 10
    ingredients: Optional[str] = None
    image_url: Optional[str] = None
    food_type: str = "VEG"  # VEG, NON_VEG
    preparation_time: str = "30 mins"
    is_available: bool = True
    is_today_menu: bool = True

class FoodCreate(FoodBase):
    pass

class FoodUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    is_evening_offer: Optional[bool] = None
    quantity: Optional[int] = None
    ingredients: Optional[str] = None
    image_url: Optional[str] = None
    food_type: Optional[str] = None
    preparation_time: Optional[str] = None
    is_available: Optional[bool] = None
    is_today_menu: Optional[bool] = None

class EveningOfferUpdate(BaseModel):
    discount_price: float
    is_evening_offer: bool = True
    quantity: Optional[int] = None

class CookSimpleOut(BaseModel):
    id: int
    kitchen_name: str
    specialization: Optional[str] = None
    rating: float
    approval_status: str
    city: Optional[str] = None

    class Config:
        from_attributes = True

class FoodOut(FoodBase):
    id: int
    cook_id: int
    created_at: datetime
    cook: Optional[CookSimpleOut] = None

    class Config:
        from_attributes = True
