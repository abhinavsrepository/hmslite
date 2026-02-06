"""
Vercel Serverless Function Entry Point
Handles API requests for unified Vercel deployment
"""
import sys
import os

# Setup path for imports - add backend directory to sys.path
# so that 'from app.main import app' resolves correctly
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Also add project root to sys.path as fallback
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Set VERCEL environment variable if not already set
os.environ.setdefault("VERCEL", "1")

# Import FastAPI app
try:
    from app.main import app as application
    print(f"[Vercel] Successfully imported FastAPI app from {backend_path}")
except ImportError as e:
    print(f"[Vercel] ERROR: Failed to import app: {e}")
    print(f"[Vercel] backend_path: {backend_path}")
    print(f"[Vercel] sys.path: {sys.path}")
    print(f"[Vercel] Files in backend_path: {os.listdir(backend_path) if os.path.exists(backend_path) else 'PATH NOT FOUND'}")
    raise

# Vercel handler - exports ASGI app for @vercel/python runtime
app = application
