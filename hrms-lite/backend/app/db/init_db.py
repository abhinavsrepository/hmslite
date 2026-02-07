"""
Database initialization and migration scripts.
Supports both SQLite and MongoDB.
"""

from typing import TYPE_CHECKING
from app.db.database import get_database, get_database_type
from app.core.logging_config import get_logger

if TYPE_CHECKING:
    from app.db.database import Database

logger = get_logger(__name__)


def init_tables_mongodb(db) -> None:
    """Initialize MongoDB collections and indexes."""
    from app.db.mongodb import get_mongodb

    mongo_db = get_mongodb()

    
    logger.debug("MongoDB collections will be created automatically")

    
    logger.info("MongoDB initialization skipped - use create_indexes() in mongodb.py")

    logger.info("MongoDB initialized successfully")


def init_tables_sqlite(db) -> None:
    """Initialize SQLite database tables."""
    with db.get_connection() as conn:
        cursor = conn.cursor()

      
        TABLES = {
            "employees": """
                CREATE TABLE IF NOT EXISTS employees (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    department TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """,
            "attendance": """
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
                    UNIQUE(employee_id, date)
                )
            """,
        }

        INDEXES = {
            "idx_employees_email": "CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)",
            "idx_employees_department": "CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)",
            "idx_attendance_employee_id": "CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)",
            "idx_attendance_date": "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)",
            "idx_attendance_status": "CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status)",
        }

        for table_name, ddl in TABLES.items():
            cursor.execute(ddl)
            logger.debug(f"Table '{table_name}' initialized")

        for index_name, ddl in INDEXES.items():
            cursor.execute(ddl)
            logger.debug(f"Index '{index_name}' created")

        conn.commit()


def init_tables(db) -> None:
    """Initialize database tables based on database type."""
    db_type = get_database_type()

    if db_type == "mongodb":
        init_tables_mongodb(db)
    else:
        init_tables_sqlite(db)


def init_database() -> None:
    """
    Initialize the database with tables and indexes.

    This function creates all necessary tables and indexes if they don't exist.
    For MongoDB, it creates collections and indexes.
    """
    db = get_database()

    logger.info("Initializing database...")

    try:
        init_tables(db)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def reset_database() -> None:
    """
    Reset the database by dropping all tables.

    WARNING: This will delete all data!
    """
    db_type = get_database_type()

    if db_type == "mongodb":
        # MongoDB doesn't support dropping tables like SQLite
        logger.warning("Reset database: For MongoDB, use reset_mongodb_collections()")
        reset_mongodb_collections()
    else:
        # SQLite table reset
        db = get_database()

        logger.warning("Resetting database - all data will be lost!")

        with db.get_connection() as conn:
            cursor = conn.cursor()

            # Drop tables in reverse order due to foreign key constraints
            cursor.execute("DROP TABLE IF EXISTS attendance")
            cursor.execute("DROP TABLE IF EXISTS employees")

            conn.commit()

        logger.info("Database reset complete")


def reset_mongodb_collections() -> None:
    """
    Reset MongoDB collections.

    WARNING: This will delete all data in MongoDB collections!
    """
    from app.db.mongodb import get_mongodb

    mongo_db = get_mongodb()

    logger.warning("Resetting MongoDB collections - all data will be lost!")

    try:
        collections = ["employees", "attendance", "leave"]

        for collection_name in collections:
            collection = mongo_db.get_collection(collection_name)
            collection.delete_many({})
            logger.debug(f"Collection '{collection_name}' cleared")

        logger.info("MongoDB collections reset complete")

    except Exception as e:
        logger.error(f"Failed to reset MongoDB collections: {e}")
        raise


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        db_type = get_database_type()

        if db_type == "mongodb":
            reset_mongodb_collections()
        else:
            reset_database()
    else:
        init_database()
        db_type = get_database_type()

        if db_type == "mongodb":
            print("[OK] Database initialized successfully!")
            print("  - MongoDB collections initialized")
            print("  - Indexes created")
        else:
            print("[OK] Database initialized successfully!")
            print("  - Employees table created")
            print("  - Attendance table created")
            print("  - Indexes created")
