"""
Test MongoDB connection and verify setup.
"""

import os
import sys
from pathlib import Path
import datetime

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings
from app.db.database import get_database


def test_mongodb_connection():
    """Test MongoDB connection."""
    print("Testing MongoDB setup...")

    try:
        # Get settings
        settings = get_settings()
        print(f"Database type: {settings.DB_TYPE}")
        print(f"MongoDB URI: {settings.MONGODB_URI[:50]}...")
        print(f"Database name: {settings.MONGODB_DB_NAME}")

        # Get database instance
        db = get_database()
        print(f"Database instance created: {db}")

        if db.is_mongodb:
            print("[OK] Successfully connected to MongoDB")

            # Test MongoDB operations
            print("\nTesting MongoDB operations...")

            # Test count operations
            employee_count = db.count_documents("employees")
            print(f"Employee count: {employee_count}")

            # Test insert
            test_doc = {
                "name": "Test User",
                "email": "test@example.com",
                "status": "active",
                "created_at": datetime.datetime.now(),
            }
            doc_id = db.insert_one("employees", test_doc)
            print(f"[OK] Inserted test document with ID: {doc_id}")

            # Test find
            found_doc = db.find_one("employees", {"email": "test@example.com"})
            print(f"[OK] Found test document: {found_doc}")

            # Test count after insert
            new_count = db.count_documents("employees")
            print(f"Employee count after insert: {new_count}")

            print("\n[SUCCESS] All MongoDB tests passed!")
            return True
        else:
            print("[WARNING] Database type is not MongoDB, using SQLite instead")
            print("To use MongoDB, set DB_TYPE=mongodb in your .env file")
            return False

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    import datetime

    success = test_mongodb_connection()
    sys.exit(0 if success else 1)
