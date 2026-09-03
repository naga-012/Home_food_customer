from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class HomeCook(Base):
    __tablename__ = "home_cooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    kitchen_name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    specialization = Column(String(200), nullable=True)  # e.g., Andhra, South Indian, Hyderabadi, Gujarati
    approval_status = Column(String(20), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED, SUSPENDED
    rating = Column(Float, default=5.0, nullable=False)
    total_reviews = Column(Integer, default=0, nullable=False)
    banner_image = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="cook_profile")
    foods = relationship("Food", back_populates="cook", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="cook", foreign_keys="Order.cook_id")
    subscriptions = relationship("Subscription", back_populates="cook")
