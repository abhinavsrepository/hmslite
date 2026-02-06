"""
Legacy main entry point - redirects to the new modular structure.

This file is kept for backward compatibility.
For new development, use `app.main` directly.
"""
import warnings

# Show deprecation warning
warnings.warn(
    "This module is deprecated. Use 'app.main' instead.",
    DeprecationWarning,
    stacklevel=2
)

# Import and re-export from new structure
from app.main import app, create_application, lifespan
from app.core.config import get_settings
import uvicorn

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
