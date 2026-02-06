"""
Database connection and session management.
"""
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class Database:
    """Database connection manager."""
    
    def __init__(self, db_path: str | None = None):
        self.settings = get_settings()
        self.db_path = db_path or self.settings.DB_PATH
        self._ensure_directory()
    
    def _ensure_directory(self) -> None:
        """Ensure the database directory exists."""
        db_path = Path(self.db_path)
        if db_path.parent != Path("."):
            db_path.parent.mkdir(parents=True, exist_ok=True)
    
    @contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """
        Get a database connection with row factory configured.
        
        Yields:
            sqlite3.Connection: Database connection with row factory set to sqlite3.Row
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    @contextmanager
    def get_cursor(self) -> Generator[sqlite3.Cursor, None, None]:
        """
        Get a database cursor.
        
        Yields:
            sqlite3.Cursor: Database cursor
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                yield cursor
                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
    
    def execute(
        self, 
        query: str, 
        parameters: tuple = (), 
        fetch_one: bool = False,
        fetch_all: bool = False
    ) -> sqlite3.Row | list[sqlite3.Row] | None:
        """
        Execute a query and optionally fetch results.
        
        Args:
            query: SQL query string
            parameters: Query parameters
            fetch_one: Fetch single row if True
            fetch_all: Fetch all rows if True
            
        Returns:
            Query results based on fetch flags
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, parameters)
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            
            conn.commit()
            return None
    
    def execute_many(self, query: str, parameters_list: list[tuple]) -> None:
        """
        Execute a query with multiple parameter sets.
        
        Args:
            query: SQL query string
            parameters_list: List of parameter tuples
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, parameters_list)
            conn.commit()


# Global database instance
_db_instance: Database | None = None


def get_database() -> Database:
    """Get the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for database connections (backward compatibility)."""
    db = get_database()
    with db.get_connection() as conn:
        yield conn
