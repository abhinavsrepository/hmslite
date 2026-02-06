"""
Vercel Serverless Function Entry Point
This file serves as the entry point for Vercel's Python serverless functions.
It imports and exposes the FastAPI application from the backend.
"""
import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import the FastAPI app
from app.main import app

# Vercel serverless handler
# The 'app' is exposed and Vercel will handle the requests
