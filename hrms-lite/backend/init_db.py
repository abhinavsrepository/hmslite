"""
Legacy database initialization - redirects to the new modular structure.

This module is kept for backward compatibility.
For new development, use `app.db.init_db` instead.
"""
import warnings
import sys

warnings.warn(
    "This module is deprecated. Use 'app.db.init_db' instead.",
    DeprecationWarning,
    stacklevel=2
)

# Import from new structure
from app.db.init_db import init_database, reset_database


if __name__ == "__main__":
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "--reset":
            reset_database()
        
        init_database()
        print("[OK] Database initialized successfully!")
        print("  - Employees table created")
        print("  - Attendance table created")
        print("  - Indexes created")
    except Exception as e:
        print(f"[ERROR] Error initializing database: {e}")
        sys.exit(1)
