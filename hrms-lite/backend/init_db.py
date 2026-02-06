from db import init_db
import sys

if __name__ == "__main__":
    try:
        init_db()
        print("[OK] Database initialized successfully!")
        print("  - Employees table created")
        print("  - Attendance table created")
    except Exception as e:
        print(f"[ERROR] Error initializing database: {e}")
        sys.exit(1)
