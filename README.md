# Inti Ruchi – Homemade Food Delivery Platform 🍲

**"Inti Ruchi"** (meaning *Home Taste / Home Flavor*) is a modern, production-grade full-stack web application designed for customers to discover and order authentic homemade delicacies from verified local home cooks.

---

## 🌟 Key Features for Customers

### 1. Storefront & Culinary Discovery
- **Hero & Search Bar**: Warm, authentic culinary design system with real-time dish search by name, ingredients, or home chef.
- **Dietary & Category Filtering**: Filter dishes by category (Breakfast, Lunch, Dinner, Biryani, Snacks, Sweets, Healthy) and dietary preference (Pure Veg / Non-Veg).
- **Dish Details & Transparency**: Full ingredient disclosure, cooking time, chef notes, hygiene badges, and verified customer reviews.
- **Evening Flash Deals (Food Waste Reduction)**: Access deeply discounted evening deals from home chefs before batches run out.
- **Smart Recommendations**: Curated dishes based on popularity and flavor profiles.

### 2. Cart, Ordering & Live Tracking
- **Interactive Cart**: Instant quantity adjustment, transparent delivery and packaging charges.
- **Customer Sign-In & Registration**: Direct customer login with email and password to secure orders and profile addresses.
- **Visual Order Tracking**: 5-stage order progression (`PENDING` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **Order History & Favorites**: View past receipts and save favorite homemade dishes with one click.
- **Reviews & Ratings**: Rate dishes 1–5 stars and submit feedback for home chefs.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib/Bcrypt.
- **Database**: SQLite / PostgreSQL ready.
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React icons, Axios, React Router.

---

## 🚀 How to Run Locally

### 1. Launch Backend (FastAPI on Port 8000)
```powershell
run_backend.bat
# Or manually:
cd backend
.\venv\Scripts\uvicorn.exe app.main:app --port 8000 --reload
```

### 2. Launch Frontend (Vite on Port 5173)
```powershell
run_frontend.bat
# Or manually:
cd frontend
npm run dev -- --port 5173
```

- **Customer Storefront**: [http://localhost:5173](http://localhost:5173)
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 👤 Customer Login Details

Customers log in using their personal email and password:
- **Email**: `customer@intiruchi.com`
- **Password**: `customer123`
*(Or click "Sign up as Foodie" on the login page to register a new account)*
