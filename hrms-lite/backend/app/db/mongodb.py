"""
MongoDB database connection and operations.
"""

from typing import Any, Dict, Generator, List, Optional
from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from bson.objectid import ObjectId
from contextlib import contextmanager
from datetime import datetime
import logging

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class MongoDB:
    """MongoDB connection and operations manager."""

    def __init__(self):
        self.settings = get_settings()
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.connect()

    def connect(self) -> None:
        """Establish MongoDB connection."""
        try:
            uri = self.settings.MONGODB_URI.strip().strip('"').strip("'")
            if not uri:
                raise ValueError("MONGODB_URI is empty. Set it as an environment variable.")

            # Log masked URI for debugging
            masked = uri[:20] + "***" + uri[-30:] if len(uri) > 50 else "***"
            logger.info(f"Connecting to MongoDB: {masked}")

            self.client = MongoClient(
                uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )

            self.client.admin.command("ping")
            self.db = self.client[self.settings.MONGODB_DB_NAME]
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @contextmanager
    def get_db(self) -> Generator[Database, None, None]:
        """Context manager for database operations."""
        if self.db is None:
            self.connect()
        if self.db is None:
            raise RuntimeError("Failed to connect to MongoDB")
        yield self.db

    def get_collection(self, collection_name: str) -> Collection:
        """Get a MongoDB collection.

        Args:
            collection_name: Name of the collection

        Returns:
            MongoDB Collection object
        """
        if self.db is None:
            self.connect()
        if self.db is None:
            raise RuntimeError("Failed to connect to MongoDB")
        return self.db[collection_name]

    def create_indexes(self) -> None:
        """Create necessary indexes for collections."""
        try:
          
            indexes = {
                "employees": [("email", ASCENDING), ("employee_id", ASCENDING)],
                "attendance": [
                    ("employee_id", ASCENDING),
                    ("date", ASCENDING),
                    ("timestamp", ASCENDING),
                ],
                "leave": [
                    ("employee_id", ASCENDING),
                    ("from_date", ASCENDING),
                    ("status", ASCENDING),
                ],
            }

            for collection_name, index_list in indexes.items():
                collection = self.get_collection(collection_name)
             
                for index_field in index_list:
                   
                    collection.create_index([index_field])
                logger.info(f"Created indexes for {collection_name}")

        except Exception as e:
            
            logger.warning(
                f"Failed to create indexes (collections will work without indexes): {e}"
            )
          

    def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Insert a single document into a collection.

        Args:
            collection_name: Name of the collection
            document: Document to insert

        Returns:
            ID of the inserted document
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.insert_one(document)
        logger.info(
            f"Inserted document into {collection_name} with ID: {result.inserted_id}"
        )
        return str(result.inserted_id)

    def insert_many(
        self, collection_name: str, documents: List[Dict[str, Any]]
    ) -> List[str]:
        """Insert multiple documents into a collection.

        Args:
            collection_name: Name of the collection
            documents: List of documents to insert

        Returns:
            List of inserted document IDs
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.insert_many(documents)
        logger.info(
            f"Inserted {len(result.inserted_ids)} documents into {collection_name}"
        )
        return [str(doc_id) for doc_id in result.inserted_ids]

    def find_one(
        self, collection_name: str, query: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Find a single document in a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter

        Returns:
            Document if found, None otherwise
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.find_one(query)
        return self._convert_objectid_to_str(result)

    def find_many(
        self,
        collection_name: str,
        query: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Find multiple documents in a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter (default: all documents)
            skip: Number of documents to skip
            limit: Maximum number of documents to return

        Returns:
            List of documents
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        cursor = collection.find(query or {}, skip=skip, limit=limit)
        result: List[Dict[str, Any]] = []
        for doc in cursor:
            converted = self._convert_objectid_to_str(doc)
            if converted is not None:
                result.append(converted)
        return result

    def update_one(
        self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]
    ) -> bool:
        """Update a single document in a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter
            update: Update data (use $set for field updates)

        Returns:
            True if update was successful
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.update_one(query, update)
        logger.info(f"Updated {result.modified_count} document in {collection_name}")
        return result.modified_count > 0

    def update_many(
        self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]
    ) -> bool:
        """Update multiple documents in a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter
            update: Update data

        Returns:
            True if update was successful
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.update_many(query, update)
        logger.info(f"Updated {result.modified_count} documents in {collection_name}")
        return result.modified_count > 0

    def delete_one(self, collection_name: str, query: Dict[str, Any]) -> bool:
        """Delete a single document from a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter

        Returns:
            True if deletion was successful
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.delete_one(query)
        logger.info(f"Deleted {result.deleted_count} document from {collection_name}")
        return result.deleted_count > 0

    def delete_many(self, collection_name: str, query: Dict[str, Any]) -> bool:
        """Delete multiple documents from a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter

        Returns:
            True if deletion was successful
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        result = collection.delete_many(query)
        logger.info(f"Deleted {result.deleted_count} documents from {collection_name}")
        return result.deleted_count > 0

    def count_documents(
        self, collection_name: str, query: Optional[Dict[str, Any]] = None
    ) -> int:
        """Count documents in a collection.

        Args:
            collection_name: Name of the collection
            query: Query filter (default: all documents)

        Returns:
            Count of matching documents
        """
        if self.db is None:
            self.connect()
        collection = self.get_collection(collection_name)
        return collection.count_documents(query or {})

    def _convert_objectid_to_str(
        self, document: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Convert ObjectId fields in document to strings.

        Args:
            document: Document to convert

        Returns:
            Document with ObjectId fields converted to strings
        """
        if document is None:
            return None

        converted = {}
        for key, value in document.items():
            if key == "_id" and isinstance(value, ObjectId):
                converted[key] = str(value)
            elif isinstance(value, list):
                converted[key] = [
                    self._convert_objectid_to_str(item)
                    if isinstance(item, dict)
                    else item
                    for item in value
                ]
            else:
                converted[key] = value

        return converted



_mongo_instance: Optional[MongoDB] = None


def get_mongodb() -> MongoDB:
    """Get the global MongoDB instance."""
    global _mongo_instance
    if _mongo_instance is None:
        _mongo_instance = MongoDB()
    return _mongo_instance


def init_mongodb() -> None:
    """Initialize MongoDB connection and create indexes."""
    db = get_mongodb()
    db.connect()
    db.create_indexes()
    logger.info("MongoDB initialized successfully")


@contextmanager
def get_mongodb_db() -> Generator[Database, None, None]:
    """Context manager for MongoDB database operations."""
    db = get_mongodb()
    with db.get_db() as mongo_db:
        yield mongo_db
