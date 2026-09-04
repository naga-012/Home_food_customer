from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cook_id = Column(Integer, ForeignKey("home_cooks.id", ondelete="SET NULL"), nullable=True)
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=30.0, nullable=False)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(20), nullable=False)
    payment_method = Column(String(20), default="COD", nullable=False)  # COD, UPI, CARD
    payment_status = Column(String(20), default="PENDING", nullable=False)  # PENDING, PAID, FAILED
    order_status = Column(String(30), default="PENDING", nullable=False)  # PENDING, ACCEPTED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REJECTED
    rejection_reason = Column(String(255), nullable=True)
    special_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    cook = relationship("HomeCook", back_populates="orders", foreign_keys=[cook_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="SET NULL"), nullable=True)
    food_name = Column(String(150), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    food = relationship("Food", back_populates="order_items")
