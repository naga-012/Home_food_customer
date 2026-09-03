from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None

class CustomerRegister(UserBase):
    password: str

class CookRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    kitchen_name: str
    description: Optional[str] = None
    specialization: Optional[str] = None
    address: str
    city: str
    pincode: Optional[str] = None
    banner_image: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class CookOut(BaseModel):
    id: int
    user_id: int
    kitchen_name: str
    description: Optional[str] = None
    specialization: Optional[str] = None
    approval_status: str
    rating: float
    total_reviews: int
    banner_image: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: bool
    created_at: datetime
    cook_profile: Optional[CookOut] = None

    class Config:
        from_attributes = True
