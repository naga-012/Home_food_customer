import os
import sys
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.audit_log import AdminAuditLog
from app.models.order import Order
from app.utils.security import hash_password

def seed_admin():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    # Check and add rejection_reason column if not exists
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "intiruchi.db")
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("PRAGMA table_info(orders)")
    cols = [col[1] for col in cur.fetchall()]
    if "rejection_reason" not in cols:
        print("Adding rejection_reason column to orders table...")
        cur.execute("ALTER TABLE orders ADD COLUMN rejection_reason VARCHAR(255)")
        con.commit()
    con.close()

    admin_email = os.getenv("ADMIN_EMAIL", "admin@intiruchi.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            print(f"Creating development Admin account ({admin_email})...")
            admin_user = User(
                name="Inti Ruchi Admin",
                email=admin_email,
                phone="9800000000",
                password_hash=hash_password(admin_password),
                role="ADMIN",
                address="Admin Headquarters, Hitec City",
                city="Hyderabad",
                pincode="500081",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("Admin account created successfully!")
        else:
            print(f"Admin account ({admin_email}) exists, ensuring role=ADMIN and active...")
            admin_user.role = "ADMIN"
            admin_user.password_hash = hash_password(admin_password)
            admin_user.is_active = True
            db.commit()
            print("Admin account verified.")

        # Ensure at least one initial audit log entry
        log_count = db.query(AdminAuditLog).count()
        if log_count == 0:
            initial_log = AdminAuditLog(
                admin_id=admin_user.id,
                admin_email=admin_user.email,
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
