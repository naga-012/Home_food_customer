import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inti Ruchi – Homemade Food Delivery Platform"
    SECRET_KEY: str = "inti-ruchi-super-secure-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./intiruchi.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    BACKEND_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    @property
    def RESOLVED_DATABASE_URL(self) -> str:
        if self.DATABASE_URL.startswith("sqlite:///./"):
            db_name = self.DATABASE_URL.replace("sqlite:///./", "")
            full_path = os.path.join(self.BACKEND_DIR, db_name).replace("\\", "/")
            return f"sqlite:///{full_path}"
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
