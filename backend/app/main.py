import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, engine
from app.models import *  # Ensure all models are loaded
from app.routes import (
    auth_router,
    users_router,
    cooks_router,
    foods_router,
    cart_router,
    orders_router,
    subscriptions_router,
    reviews_router,
    favorites_router,
    notifications_router,
    admin_router,
)

from contextlib import asynccontextmanager
from app.seed_data import auto_seed_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and database has seed data on deployment
    Base.metadata.create_all(bind=engine)
    auto_seed_if_empty()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Inti Ruchi – Production-style Homemade Food Delivery Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration: allow any origin (e.g. Render frontends, localhost, mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all API Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(cooks_router)
app.include_router(foods_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(subscriptions_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(notifications_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "Online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "description": "Connecting food lovers with passionate local home chefs!",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Inti Ruchi API"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload images for foods and home cook kitchen banners"""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload jpg, png, webp, or svg.")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{filename}", "filename": filename}
