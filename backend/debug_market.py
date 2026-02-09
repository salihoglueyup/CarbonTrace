import sys
import os

# Add the current directory to sys.path so we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

print(f"Running debug script in: {current_dir}")
print(f"Python executable: {sys.executable}")

try:
    print("1. Attempting to import yfinance...")
    import yfinance

    print("✅ yfinance imported successfully.")
except ImportError as e:
    print(f"❌ FAILED to import yfinance: {e}")
    sys.exit(1)

try:
    print("2. Attempting to import feedparser...")
    import feedparser

    print("✅ feedparser imported successfully.")
except ImportError as e:
    print(f"❌ FAILED to import feedparser: {e}")
    sys.exit(1)

try:
    print("3. Attempting to import market router...")
    from app.api.routes import market

    print("✅ Market router imported successfully.")
except ImportError as e:
    print(f"❌ FAILED to import market router: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"❌ FAILED with unexpected error: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)

print("🎉 ALL CHECKS PASSED! The code is valid.")
print("If you still see 404, please RESTART your backend server manually.")
