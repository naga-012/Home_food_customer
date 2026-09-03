from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cook_id = Column(Integer, ForeignKey("home_cooks.id", ondelete="SET NULL"), nullable=True)
    plan_name = Column(String(100), nullable=False)  # e.g., "Daily Lunch Tiffin", "Weekly 7-Day Healthy Plan"
    plan_type = Column(String(50), nullable=False)  # DAILY_BREAKFAST, DAILY_LUNCH, DAILY_DINNER, WEEKLY_7_DAY, MONTHLY_30_DAY
    start_date = Column(String(30), nullable=False)
    delivery_time = Column(String(30), nullable=False)  # e.g. "12:30 PM", "8:00 PM"
    delivery_address = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, PAUSED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="subscriptions")
    cook = relationship("HomeCook", back_populates="subscriptions")
