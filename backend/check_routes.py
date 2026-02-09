import sys
import os

# Ensure we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from main import app

print("\n--- Checking Registered Routes ---")
found_market = False
for route in app.routes:
    if hasattr(route, "path"):
        methods = getattr(route, "methods", ["WS"])
        print(f"Route: {route.path} [{','.join(methods)}]")
        if "/api/market" in route.path:
            found_market = True

if found_market:
    print("\n✅ SUCCESS: Market routes are registered!")
else:
    print("\n❌ FAILURE: Market routes are MISSING from app.routes!")
