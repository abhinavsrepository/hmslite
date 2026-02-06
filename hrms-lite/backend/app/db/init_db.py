"""
Database initialization and migration scripts.
"""
from app.db.database import get_database
from app.core.logging_config import get_logger

logger = get_logger(__name__)


# SQL DDL statements for table creation
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

# Indexes for performance
INDEXES = {
    "idx_employees_email": "CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)",
    "idx_employees_department": "CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)",
    "idx_attendance_employee_id": "CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)",
    "idx_attendance_date": "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)",
    "idx_attendance_status": "CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status)",
}


def init_tables(db: "Database") -> None:
    """Initialize database tables."""
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        for table_name, ddl in TABLES.items():
            cursor.execute(ddl)
            logger.debug(f"Table '{table_name}' initialized")
        
        conn.commit()


def init_indexes(db: "Database") -> None:
    """Initialize database indexes."""
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        for index_name, ddl in INDEXES.items():
            cursor.execute(ddl)
            logger.debug(f"Index '{index_name}' created")
        
        conn.commit()


def init_database() -> None:
    """
    Initialize the database with tables and indexes.
    
    This function creates all necessary tables and indexes if they don't exist.
    """
    db = get_database()
    
    logger.info("Initializing database...")
    
    try:
        init_tables(db)
        init_indexes(db)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def reset_database() -> None:
    """
    Reset the database by dropping all tables.
    
    WARNING: This will delete all data!
    """
    db = get_database()
    
    logger.warning("Resetting database - all data will be lost!")
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # Drop tables in reverse order due to foreign key constraints
        cursor.execute("DROP TABLE IF EXISTS attendance")
        cursor.execute("DROP TABLE IF EXISTS employees")
        
        conn.commit()
    
    logger.info("Database reset complete")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        reset_database()
    
    init_database()
    print("[OK] Database initialized successfully!")
    print("  - Employees table created")
    print("  - Attendance table created")
    print("  - Indexes created")
