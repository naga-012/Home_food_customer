import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

def request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {path}: {err_content}")
        raise e

def test_storefront():
    print("\n--- 1. Testing Storefront & Food Discovery API ---")
    status, foods = request("GET", "/api/foods")
    assert status == 200, "Failed to get foods"
    assert len(foods) >= 20, f"Expected at least 20 foods, got {len(foods)}"
    print(f"✓ GET /api/foods: Returned {len(foods)} delicious dishes")

    # Filter by category
    status, lunch_foods = request("GET", "/api/foods?category=Lunch&food_type=VEG")
    assert status == 200
    print(f"✓ GET /api/foods?category=Lunch&food_type=VEG: Returned {len(lunch_foods)} vegetarian lunch dishes")

    # Smart recommendations
    status, recs = request("GET", "/api/foods/recommendations")
    assert status == 200
    print(f"✓ GET /api/foods/recommendations: Returned {len(recs)} smart recommended dishes")

    # Evening flash deals
    status, deals = request("GET", "/api/foods/evening-offers")
    assert status == 200
    print(f"✓ GET /api/foods/evening-offers: Returned {len(deals)} active food waste reduction deals")

def test_customer_flow():
    print("\n--- 2. Testing Customer Journey (Order, Cart, Favorites, Subscriptions) ---")
    # Login
    status, auth = request("POST", "/api/auth/login", {"email": "customer@intiruchi.com", "password": "customer123"})
    token = auth["access_token"]
    user = auth["user"]
    print(f"✓ Customer logged in: {user['name']} (ID: {user['id']})")

    # Get Cart
    status, cart = request("GET", "/api/cart", token=token)
    assert status == 200
    print(f"✓ GET /api/cart: Cart items count = {len(cart.get('items', []))}")

    # Add item to cart
    status, added = request("POST", "/api/cart/add", {"food_id": 1, "quantity": 2}, token=token)
    assert status == 200
    print(f"✓ POST /api/cart/add: Added 2 portions of Food #1 to cart (Total: ₹{added.get('total_amount')})")

    # Place order
    order_payload = {
        "delivery_address": "Flat 304, Cyber Heights, HITEC City",
        "city": "Hyderabad",
        "pincode": "500081",
        "phone": "9876543210",
        "payment_method": "UPI",
        "special_instructions": "Please deliver hot, extra chutney if possible!"
    }
    status, order = request("POST", "/api/orders", order_payload, token=token)
    assert status == 200
    order_id = order["id"]
    order_num = order["order_number"]
    print(f"✓ POST /api/orders: Order placed successfully! Order #{order_num}, Total: ₹{order['total_amount']}")

    # Check orders
    status, orders = request("GET", "/api/orders", token=token)
    assert status == 200
    assert any(o["id"] == order_id for o in orders)
    print(f"✓ GET /api/orders: Customer now has {len(orders)} order(s) in history")

    # Toggle favorite
    status, fav = request("POST", "/api/favorites/2", token=token)
    assert status == 200
    print(f"✓ POST /api/favorites/2: Favorited food item #2 ({fav.get('message')})")

    return order_id

def test_cook_flow(order_id):
    print("\n--- 3. Testing Home Cook Operations & Order Lifecycle ---")
    # Cook login
    status, auth = request("POST", "/api/auth/login", {"email": "amma@intiruchi.com", "password": "cook123"})
    token = auth["access_token"]
    print(f"✓ Home Cook logged in: {auth['user']['name']} ({auth['user'].get('kitchen_name')})")

    # Dashboard stats
    status, dash = request("GET", "/api/cooks/my/dashboard", token=token)
    assert status == 200
    print(f"✓ GET /api/cooks/my/dashboard: Kitchen Rating = {dash['rating']}⭐, Total Dishes = {dash['total_foods']}")

    # Today's menu
    status, menu = request("GET", "/api/cooks/my/todays-menu", token=token)
    assert status == 200
    print(f"✓ GET /api/cooks/my/todays-menu: Found {len(menu)} featured dishes on Today's Menu")

    # Broadcast evening flash deal for food waste reduction
    flash_payload = {
        "discount_price": 99.0,
        "quantity": 6,
        "is_evening_offer": True
    }
    status, flash = request("POST", "/api/foods/1/evening-offer", flash_payload, token=token)
    assert status == 200
    print(f"✓ POST /api/foods/1/evening-offer: Flash deal broadcasted! Discount Price: ₹{flash['discount_price']}")

    # Lifecycle order status updates
    for next_status in ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"]:
        status, updated_order = request("PUT", f"/api/orders/{order_id}/status", {"order_status": next_status}, token=token)
        assert status == 200
        print(f"✓ Order #{updated_order['order_number']} progressed to status: {next_status}")

def test_frontend():
    print("\n--- 4. Testing Frontend Application Health ---")
    req = urllib.request.Request(FRONTEND_URL)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")
        assert resp.status == 200
        assert "Inti Ruchi" in html
        assert 'id="root"' in html
        print("✓ Frontend HTTP 200 OK: Vite dev server serving HTML with 'Inti Ruchi' title and React root container")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING CUSTOMER-CENTRIC AUTOMATED TEST FOR INTI RUCHI")
    print("=" * 60)
    try:
        test_storefront()
        created_order_id = test_customer_flow()
        test_cook_flow(created_order_id)
        test_frontend()
        print("\n" + "=" * 60)
        print("ALL CUSTOMER TESTS PASSED WITH 100% SUCCESS!")
        print("Customer Storefront, Cart, Orders, & Search are fully operational!")
        print("=" * 60)
    except Exception as err:
        print("\n❌ TEST FAILED:", err)
        sys.exit(1)
