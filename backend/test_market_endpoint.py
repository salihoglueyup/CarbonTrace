from fastapi.testclient import TestClient
import sys
import os

# Ensure we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
# Ensure we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
# parent_dir = os.path.dirname(current_dir) # If running from outside backend, or if app is direct child
sys.path.insert(
    0, current_dir
)  # If app is inside backend/app... wait, app is a package inside backend
# structure is:
# backend/
#   app/
#     main.py
#   test_market_endpoint.py
# So if we are in backend/, `import app.main` should work if backend/ is in path.
# The previous script append `current_dir` which is `backend/`.
# Maybe `app` is not a package? Does `backend/app/__init__.py` exist?

from main import app

client = TestClient(app)

print("Testing /api/market/news endpoint...")
response = client.get("/api/market/news?limit=5")

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("✅ Success! API returned 200.")
    print("Response sample:", str(response.json())[:100])
else:
    print("❌ Failed!")
    print("Response:", response.text)

print("\nTesting /api/market/carbon-price endpoint...")
response_price = client.get("/api/market/carbon-price")
print(f"Status Code: {response_price.status_code}")
if response_price.status_code == 200:
    print("✅ Success! Price API returned 200.")
else:
    print("❌ Failed Price API!")
