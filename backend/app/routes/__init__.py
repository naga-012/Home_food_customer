from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.cooks import router as cooks_router
from app.routes.foods import router as foods_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as orders_router
from app.routes.subscriptions import router as subscriptions_router
from app.routes.reviews import router as reviews_router
from app.routes.favorites import router as favorites_router
from app.routes.notifications import router as notifications_router

__all__ = [
    "admin_router",
    "auth_router",
    "users_router",
    "cooks_router",
    "foods_router",
    "cart_router",
    "orders_router",
    "subscriptions_router",
    "reviews_router",
    "favorites_router",
    "notifications_router",
]
