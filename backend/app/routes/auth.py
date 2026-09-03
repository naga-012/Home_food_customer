from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.cook import HomeCook
from app.models.cart import Cart
from app.schemas.auth import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import CustomerRegister, CookRegister, UserProfileUpdate, ChangePasswordRequest, UserOut
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_customer(data: CustomerRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="CUSTOMER",
        address=data.address,
        city=data.city or "Hyderabad",
        pincode=data.pincode,
        profile_image=data.profile_image,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty cart for the customer
    cart = Cart(customer_id=user.id)
    db.add(cart)
    db.commit()

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
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
            "address": user.address,
        },
    }

@router.post("/register-cook", response_model=Token)
def register_cook(data: CookRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="HOME_COOK",
        address=data.address,
        city=data.city,
        pincode=data.pincode,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    cook = HomeCook(
        user_id=user.id,
        kitchen_name=data.kitchen_name,
        description=data.description,
        specialization=data.specialization,
        approval_status="PENDING",  # Initial status per prompt: PENDING APPROVAL
        rating=5.0,
        total_reviews=0,
        banner_image=data.banner_image,
    )
    db.add(cook)
    db.commit()
    db.refresh(cook)

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
            "kitchen_name": cook.kitchen_name,
            "approval_status": cook.approval_status,
        },
    }

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated. Please contact support.")

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    
    user_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "city": user.city,
        "address": user.address,
        "pincode": user.pincode,
    }

    if user.cook_profile:
        user_payload["cook_id"] = user.cook_profile.id
        user_payload["kitchen_name"] = user.cook_profile.kitchen_name
        user_payload["approval_status"] = user.cook_profile.approval_status

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_payload,
    }

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.address is not None:
        current_user.address = data.address
    if data.city is not None:
        current_user.city = data.city
    if data.pincode is not None:
        current_user.pincode = data.pincode
    if data.profile_image is not None:
        current_user.profile_image = data.profile_image

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(data: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password does not match")
    
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Avoid user enumeration in production, but provide helpful demo feedback
        return {"message": "If an account exists with this email, a reset link/code has been generated."}
    return {
        "message": "Reset token generated successfully. For demo purposes, you can use token 'demo-reset-token'.",
        "reset_token": "demo-reset-token",
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password has been successfully reset. You may now login."}
