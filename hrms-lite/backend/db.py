"""
Legacy database module - redirects to the new modular structure.

This module is kept for backward compatibility.
For new development, use `app.db.database` instead.
"""
import warnings

warnings.warn(
    "This module is deprecated. Use 'app.db.database' instead.",
    DeprecationWarning,
    stacklevel=2
)

# Import and re-export from new structure
from app.db.database import (
    Database,
    get_database,
    get_db_connection,
)

# Legacy compatibility
DB_PATH = "hrms.db"


def init_db():
    """Legacy init_db function - redirects to new implementation."""
    from app.db.init_db import init_database
    init_database()
