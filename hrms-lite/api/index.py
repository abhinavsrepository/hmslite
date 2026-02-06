"""
Vercel Serverless Function Entry Point
Handles API requests for unified Vercel deployment
"""
import sys
import os

# Setup path for imports
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import FastAPI app
try:
    from app.main import app as application
except ImportError as e:
    import logging
    logging.basicConfig(level=logging.ERROR)
    logging.error(f"Failed to import app: {e}")
    raise

# Vercel handler - this is called for each request
# The 'application' is the FastAPI ASGI app
app = application

# For debugging - log startup
print("[Vercel] API handler initialized")
