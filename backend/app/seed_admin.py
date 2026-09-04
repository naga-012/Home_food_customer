import os
import sys
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.audit_log import AdminAuditLog
from app.models.order import Order
from app.utils.security import hash_password

ADMIN_ACCOUNTS = [
    {
        "name": "Nagarjun Admin",
        "email": "myakalanagarjun09@gmail.com",
        "password": "naga@012",
        "phone": "9800000001",
    },
    {
        "name": "Inti Ruchi Admin",
        "email": "admin@intiruchi.com",
        "password": "admin123",
        "phone": "9800000000",
    }
]

def seed_admin():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    if engine.dialect.name == "sqlite":
        try:
            from app.config import settings
            db_path = os.path.join(settings.BACKEND_DIR, "intiruchi.db")
            if os.path.exists(db_path):
                con = sqlite3.connect(db_path)
                cur = con.cursor()
                cur.execute("PRAGMA table_info(orders)")
                cols = [col[1] for col in cur.fetchall()]
                if cols and "rejection_reason" not in cols:
                    print("Adding rejection_reason column to orders table...")
                    cur.execute("ALTER TABLE orders ADD COLUMN rejection_reason VARCHAR(255)")
                    con.commit()
                con.close()
        except Exception as e:
            print(f"Migration check notice: {e}")

    db = SessionLocal()
    try:
        primary_admin = None
        for acc in ADMIN_ACCOUNTS:
            admin_user = db.query(User).filter(User.email == acc["email"]).first()
            if not admin_user:
                print(f"Creating Admin account ({acc['email']})...")
                admin_user = User(
                    name=acc["name"],
                    email=acc["email"],
                    phone=acc["phone"],
                    password_hash=hash_password(acc["password"]),
                    role="ADMIN",
                    address="Admin Headquarters, Hitec City",
                    city="Hyderabad",
                    pincode="500081",
                    is_active=True,
                )
                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)
                print(f"Admin account ({acc['email']}) created successfully!")
            else:
                admin_user.role = "ADMIN"
                admin_user.password_hash = hash_password(acc["password"])
                admin_user.is_active = True
                db.commit()
                print(f"Admin account ({acc['email']}) verified and password synchronized.")
            
            if not primary_admin:
                primary_admin = admin_user

        # Ensure at least one initial audit log entry
        log_count = db.query(AdminAuditLog).count()
        if log_count == 0 and primary_admin:
            initial_log = AdminAuditLog(
                admin_id=primary_admin.id,
                admin_email=primary_admin.email,
                action="SYSTEM_INIT",
                details="Admin system initialized with unified single database",
            )
            db.add(initial_log)
            db.commit()
            print("Initial admin audit log recorded.")

        print("Admin setup complete!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()