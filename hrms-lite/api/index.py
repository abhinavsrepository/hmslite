"""
Vercel Serverless Function Entry Point
This file serves as the entry point for Vercel serverless functions.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
from app.core.config import get_settings
from app.db.init_db import init_database

# Initialize database on cold start
init_database()

# Vercel handler
# The app is already configured with CORS in main.py
# Just need to expose it for Vercel

# For Vercel serverless
def handler(request, response):
    """Vercel serverless handler."""
    return app(request, response)
