"""
Database connection and session management.
Supports both SQLite and MongoDB.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator, TYPE_CHECKING, Optional, Any, List, Dict

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

if TYPE_CHECKING:
    from app.db.mongodb import MongoDB


def get_database_type() -> str:
    """Get the current database type."""
    return get_settings().DB_TYPE


class Database:
    """Database connection manager - supports both SQLite and MongoDB."""

    def __init__(self, db_path: str | None = None):
        self.settings = get_settings()
        self.db_type = get_database_type()

        if self.db_type == "mongodb":
            self._mongo_db: Optional["MongoDB"] = None
        else:
            self.db_path = db_path or self.settings.DB_PATH
            self._ensure_directory()

    def _ensure_directory(self) -> None:
        """Ensure the database directory exists."""
        if self.db_type == "sqlite":
            db_path = Path(self.db_path)
            if db_path.parent != Path("."):
                db_path.parent.mkdir(parents=True, exist_ok=True)

    @property
    def is_mongodb(self) -> bool:
        """Check if currently using MongoDB."""
        return self.db_type == "mongodb"

    def get_mongo_client(self) -> "MongoDB":
        """Get MongoDB client instance."""
        if not self.is_mongodb:
            raise RuntimeError("MongoDB is not configured")

        if self._mongo_db is None:
            from app.db.mongodb import get_mongodb

            self._mongo_db = get_mongodb()

        return self._mongo_db

    @contextmanager
    def get_connection(self) -> Generator[Any, None, None]:
        """
        Get a database connection.

        Yields:
            sqlite3.Connection for SQLite, MongoDB Database for MongoDB
        """
        if self.is_mongodb:
            with self.get_mongo_client().get_db() as db:
                yield db
        else:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            try:
                yield conn
            finally:
                conn.close()

    @contextmanager
    def get_cursor(self) -> Generator[Any, None, None]:
        """
        Get a database cursor.

        Yields:
            sqlite3.Cursor for SQLite, None for MongoDB (use MongoDB operations directly)
        """
        if self.is_mongodb:
            yield None
            return

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
        fetch_all: bool = False,
    ) -> Any:
        """
        Execute a query and optionally fetch results.

        Args:
            query: SQL query string (ignored for MongoDB)
            parameters: Query parameters (ignored for MongoDB)
            fetch_one: Fetch single row if True
            fetch_all: Fetch all rows if True

        Returns:
            Query results based on fetch flags
        """
        if self.is_mongodb:
            raise NotImplementedError(
                "Use MongoDB-specific methods for MongoDB database"
            )

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
            query: SQL query string (ignored for MongoDB)
            parameters_list: List of parameter tuples (ignored for MongoDB)
        """
        if self.is_mongodb:
            raise NotImplementedError(
                "Use MongoDB-specific methods for MongoDB database"
            )

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, parameters_list)
            conn.commit()

    def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Insert a single document into MongoDB collection."""
        return self.get_mongo_client().insert_one(collection_name, document)

    def insert_many(
        self, collection_name: str, documents: List[Dict[str, Any]]
    ) -> List[str]:
        """Insert multiple documents into MongoDB collection."""
        return self.get_mongo_client().insert_many(collection_name, documents)

    def find_one(
        self, collection_name: str, query: Dict[str, Any]
    ) -> Dict[str, Any] | None:
        """Find a single document in MongoDB collection."""
        return self.get_mongo_client().find_one(collection_name, query)

    def find_many(
        self,
        collection_name: str,
        query: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Find multiple documents in MongoDB collection."""
        if query is None:
            query = {}
        return self.get_mongo_client().find_many(collection_name, query, skip, limit)

    def update_one(
        self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]
    ) -> bool:
        """Update a single document in MongoDB collection."""
        return self.get_mongo_client().update_one(collection_name, query, update)

    def update_many(
        self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]
    ) -> bool:
        """Update multiple documents in MongoDB collection."""
        return self.get_mongo_client().update_many(collection_name, query, update)

    def delete_one(self, collection_name: str, query: Dict[str, Any]) -> bool:
        """Delete a single document from MongoDB collection."""
        return self.get_mongo_client().delete_one(collection_name, query)

    def delete_many(self, collection_name: str, query: Dict[str, Any]) -> bool:
        """Delete multiple documents from MongoDB collection."""
        return self.get_mongo_client().delete_many(collection_name, query)

    def count_documents(
        self, collection_name: str, query: Optional[Dict[str, Any]] = None
    ) -> int:
        """Count documents in MongoDB collection."""
        if query is None:
            query = {}
        return self.get_mongo_client().count_documents(collection_name, query)


# Global database instance
_db_instance: Database | None = None


def get_database() -> Database:
    """Get the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


@contextmanager
def get_db_connection() -> Generator:
    """Context manager for database connections (backward compatibility)."""
    db = get_database()
    if db.is_mongodb:
        yield db.get_mongo_client().get_db()
    else:
        yield db.get_connection()
