from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SubscriptionCreate(BaseModel):
    plan_name: str
    plan_type: str  # DAILY_BREAKFAST, DAILY_LUNCH, DAILY_DINNER, WEEKLY_7_DAY, MONTHLY_30_DAY
    start_date: str
    delivery_time: str
    delivery_address: str
    price: float
    cook_id: Optional[int] = None
    notes: Optional[str] = None

class SubscriptionStatusUpdate(BaseModel):
    status: str  # ACTIVE, PAUSED, CANCELLED

class SubscriptionOut(BaseModel):
    id: int
    customer_id: int
    cook_id: Optional[int] = None
    plan_name: str
    plan_type: str
    start_date: str
    delivery_time: str
    delivery_address: str
    price: float
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
