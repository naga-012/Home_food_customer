import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

print("============================================================")
print("LIVE APPLICATION VALIDATION TEST")
print("============================================================")

# 1. Test Search Endpoint
print("\n[1] Testing Live Search Endpoint:")
for query in ["Biryani", "Dal", "Dosa", "Paneer"]:
    req = urllib.request.Request(f"{BASE_URL}/api/foods?search={query}")
    with urllib.request.urlopen(req) as resp:
        foods = json.loads(resp.read().decode())
        print(f"  ✓ Search '{query}': Found {len(foods)} items (First: {foods[0]['name'] if foods else 'None'})")

# 2. Test Customer Authentication with Credentials
print("\n[2] Testing Customer Authentication with Personal Credentials:")
login_payload = json.dumps({"email": "customer@intiruchi.com", "password": "customer123"}).encode()
login_req = urllib.request.Request(
    f"{BASE_URL}/api/auth/login",
    data=login_payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(login_req) as resp:
    auth_data = json.loads(resp.read().decode())
    token = auth_data["access_token"]
    user = auth_data["user"]
    print(f"  ✓ Logged in Customer: {user['name']} ({user['email']}), Role: {user['role']}")

# 3. Test Customer Dashboard API
print("\n[3] Testing Customer Dashboard API:")
dash_req = urllib.request.Request(
    f"{BASE_URL}/api/users/dashboard",
    headers={"Authorization": f"Bearer {token}"}
)
with urllib.request.urlopen(dash_req) as resp:
    dash_data = json.loads(resp.read().decode())
    print(f"  ✓ Customer Overview: {dash_data['total_orders']} Total Orders, {dash_data['total_favorites']} Favorites")

# 4. Test Customer Orders
print("\n[4] Testing Customer Orders:")
orders_req = urllib.request.Request(
    f"{BASE_URL}/api/orders",
    headers={"Authorization": f"Bearer {token}"}
)
with urllib.request.urlopen(orders_req) as resp:
    orders = json.loads(resp.read().decode())
    print(f"  ✓ Customer Orders: {len(orders)} order(s) retrieved successfully")

# 5. Verify Frontend HTTP Server
print("\n[5] Testing Frontend Server on Port 5173:")
front_req = urllib.request.Request("http://localhost:5173")
with urllib.request.urlopen(front_req) as resp:
    html = resp.read().decode()
    assert resp.status == 200
    assert "Inti Ruchi" in html
    print("  ✓ Frontend UI is UP and responsive at http://localhost:5173")

print("\n============================================================")
print("ALL LIVE TESTS COMPLETED SUCCESSFULLY!")
print("============================================================")
