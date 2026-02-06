"""
Vercel Serverless Function Entry Point
This file serves as the entry point for Vercel's Python serverless functions.
"""
import sys
import os

# Get the absolute path to backend directory
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Add backend to path if not already there
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the FastAPI app from backend
# Note: Pylance may show import error, but it works at runtime on Vercel
try:
    from app.main import app
except ImportError as e:
    import logging
    logging.error(f"Failed to import app: {e}")
    raise
