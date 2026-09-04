from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class OrderItemOut(BaseModel):
    id: int
    food_id: Optional[int] = None
    food_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True

class CustomerSummaryOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool

    class Config:
        from_attributes = True

class AdminOrderOut(BaseModel):
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
    rejection_reason: Optional[str] = None
    special_instructions: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    customer: Optional[CustomerSummaryOut] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class PaginatedOrdersOut(BaseModel):
    items: List[AdminOrderOut]
    page: int
    limit: int
    total: int
    total_pages: int

class OrderStatusUpdateAdmin(BaseModel):
    status: str
    payment_status: Optional[str] = None
    rejection_reason: Optional[str] = None

class OrderRejectRequest(BaseModel):
    reason: str

class CustomerListItemOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime
    total_orders: int
    total_spending: float
    last_order_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class CustomerDetailOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime
    total_orders: int
    completed_orders: int
    cancelled_orders: int
    total_spending: float
    recent_orders: List[AdminOrderOut] = []

    class Config:
        from_attributes = True

class CookAdminOut(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    kitchen_name: str
    description: Optional[str] = None
    specialization: Optional[str] = None
    approval_status: str
    rating: float
    total_reviews: int
    total_orders: int
    banner_image: Optional[str] = None

    class Config:
        from_attributes = True


class FoodCreateAdmin(BaseModel):
    cook_id: int
    name: str
    description: Optional[str] = ""
    category: str
    price: float
    discount_price: Optional[float] = None
    is_evening_offer: bool = False
    quantity: int = 10
    food_type: str = "VEG"  # "VEG" or "NON_VEG"
    preparation_time: str = "30 mins"
    is_available: bool = True
    is_today_menu: bool = True
    image_url: Optional[str] = None

class FoodAdminOut(BaseModel):
    id: int
    cook_id: int
    cook_name: Optional[str] = None
    kitchen_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: str
    price: float
    discount_price: Optional[float] = None
    is_evening_offer: bool
    quantity: int
    food_type: str
    preparation_time: str
    is_available: bool
    is_today_menu: bool
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FoodStatusUpdate(BaseModel):
    is_available: Optional[bool] = None
    is_today_menu: Optional[bool] = None
    price: Optional[float] = None

class CategoryStatOut(BaseModel):
    name: str
    food_count: int
    is_active: bool = True

class AuditLogOut(BaseModel):
    id: int
    admin_email: str
    action: str
    order_number: Optional[str] = None
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
