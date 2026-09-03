from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    cook_id = Column(Integer, ForeignKey("home_cooks.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)  # Breakfast, Lunch, Dinner, Biryani, Snacks, Desserts, Healthy Food
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    is_evening_offer = Column(Boolean, default=False, nullable=False)
    quantity = Column(Integer, default=10, nullable=False)
    ingredients = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    food_type = Column(String(10), default="VEG", nullable=False)  # VEG, NON_VEG
    preparation_time = Column(String(50), default="30 mins", nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    is_today_menu = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cook = relationship("HomeCook", back_populates="foods")
    cart_items = relationship("CartItem", back_populates="food", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="food")
    reviews = relationship("Review", back_populates="food", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="food", cascade="all, delete-orphan")
