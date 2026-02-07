"""
Employee service layer for business logic.
Supports both SQLite and MongoDB.
"""
from typing import List
from datetime import datetime

from app.db.database import get_database, Database
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.exceptions import (
    NotFoundException, 
    DuplicateException,
    raise_not_found,
    raise_duplicate
)
from app.core.logging_config import get_logger

logger = get_logger(__name__)

COLLECTION_NAME = "employees"


class EmployeeService:
    """Service class for employee operations."""
    
    def __init__(self, db: Database | None = None):
        self.db = db or get_database()
    
    def create_employee(self, employee: EmployeeCreate) -> EmployeeResponse:
        """
        Create a new employee.
        
        Args:
            employee: Employee creation data
            
        Returns:
            Created employee response
            
        Raises:
            DuplicateException: If employee ID or email already exists
        """
        # Check for existing ID
        existing = self._get_by_id(employee.id)
        if existing:
            raise_duplicate("Employee", "ID")
        
        # Check for existing email
        existing_email = self._get_by_email(employee.email)
        if existing_email:
            raise_duplicate("Employee", "email")
        
        if self.db.is_mongodb:
            # MongoDB insert
            document = employee.model_dump()
            document["created_at"] = datetime.utcnow()
            self.db.insert_one(COLLECTION_NAME, document)
            logger.info(f"Employee created: {employee.id}")
            return self._doc_to_response(document)
        else:
            # SQLite insert
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO employees (id, name, email, department) 
                    VALUES (?, ?, ?, ?)
                    """,
                    (employee.id, employee.name, employee.email, employee.department)
                )
                conn.commit()
                
                # Fetch created employee
                cursor.execute("SELECT * FROM employees WHERE id = ?", (employee.id,))
                row = cursor.fetchone()
                logger.info(f"Employee created: {employee.id}")
                return EmployeeResponse(**dict(row))
    
    def _doc_to_response(self, doc: dict) -> EmployeeResponse:
        """Convert MongoDB document to EmployeeResponse."""
        # Make a copy to avoid modifying original
        data = dict(doc)
        # Handle _id vs id
        if "_id" in data and "id" not in data:
            data["id"] = str(data.pop("_id"))
        # Ensure required fields exist with defaults
        if "name" not in data or data["name"] is None:
            data["name"] = "Unknown"
        if "email" not in data or data["email"] is None:
            data["email"] = "unknown@example.com"
        if "department" not in data or data["department"] is None:
            data["department"] = "Unassigned"
        if "created_at" not in data or data["created_at"] is None:
            data["created_at"] = datetime.utcnow()
        return EmployeeResponse(**data)
    
    def get_employees(self) -> List[EmployeeResponse]:
        """
        Get all employees.
        
        Returns:
            List of employee responses
        """
        if self.db.is_mongodb:
            # MongoDB find
            docs = self.db.find_many(COLLECTION_NAME, limit=1000)
            return [self._doc_to_response(doc) for doc in docs]
        else:
            # SQLite query
            rows = self.db.execute(
                "SELECT * FROM employees ORDER BY created_at DESC",
                fetch_all=True
            )
            return [EmployeeResponse(**dict(row)) for row in (rows or [])]
    
    def get_employee(self, employee_id: str) -> EmployeeResponse:
        """
        Get a single employee by ID.
        
        Args:
            employee_id: Employee ID
            
        Returns:
            Employee response
            
        Raises:
            NotFoundException: If employee not found
        """
        row = self._get_by_id(employee_id)
        if not row:
            raise_not_found("Employee", employee_id)
        if self.db.is_mongodb:
            return self._doc_to_response(row)
        return EmployeeResponse(**row)
    
    def update_employee(
        self, 
        employee_id: str, 
        employee_update: EmployeeUpdate
    ) -> EmployeeResponse:
        """
        Update an existing employee.
        
        Args:
            employee_id: Employee ID to update
            employee_update: Update data
            
        Returns:
            Updated employee response
            
        Raises:
            NotFoundException: If employee not found
            DuplicateException: If email already exists
        """
        # Check employee exists
        if not self._get_by_id(employee_id):
            raise_not_found("Employee", employee_id)
        
        # Check email uniqueness if being updated
        update_data = employee_update.model_dump(exclude_unset=True)
        if "email" in update_data:
            existing = self._get_by_email(update_data["email"])
            if existing and existing.get("id") != employee_id:
                raise_duplicate("Employee", "email")
        
        if self.db.is_mongodb:
            # MongoDB update
            if update_data:
                self.db.update_one(
                    COLLECTION_NAME,
                    {"id": employee_id},
                    {"$set": update_data}
                )
                logger.info(f"Employee updated: {employee_id}")
        else:
            # SQLite update
            if update_data:
                set_clause = ", ".join([f"{k} = ?" for k in update_data.keys()])
                values = list(update_data.values())
                values.append(employee_id)
                
                with self.db.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        f"UPDATE employees SET {set_clause} WHERE id = ?",
                        values
                    )
                    conn.commit()
                    logger.info(f"Employee updated: {employee_id}")
        
        # Return updated employee
        updated = self._get_by_id(employee_id)
        if self.db.is_mongodb:
            return self._doc_to_response(updated)
        return EmployeeResponse(**updated)
    
    def delete_employee(self, employee_id: str) -> None:
        """
        Delete an employee.
        
        Args:
            employee_id: Employee ID to delete
            
        Raises:
            NotFoundException: If employee not found
        """
        if self.db.is_mongodb:
            # MongoDB delete
            result = self.db.delete_one(COLLECTION_NAME, {"id": employee_id})
            if not result:
                raise_not_found("Employee", employee_id)
            logger.info(f"Employee deleted: {employee_id}")
        else:
            # SQLite delete
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
                
                if cursor.rowcount == 0:
                    raise_not_found("Employee", employee_id)
                
                conn.commit()
                logger.info(f"Employee deleted: {employee_id}")
    
    def employee_exists(self, employee_id: str) -> bool:
        """
        Check if an employee exists.
        
        Args:
            employee_id: Employee ID to check
            
        Returns:
            True if exists, False otherwise
        """
        return self._get_by_id(employee_id) is not None
    
    def _get_by_id(self, employee_id: str) -> dict | None:
        """Get employee row by ID (internal method)."""
        if self.db.is_mongodb:
            return self.db.find_one(COLLECTION_NAME, {"id": employee_id})
        else:
            row = self.db.execute(
                "SELECT * FROM employees WHERE id = ?",
                (employee_id,),
                fetch_one=True
            )
            return dict(row) if row else None
    
    def _get_by_email(self, email: str) -> dict | None:
        """Get employee row by email (internal method)."""
        if self.db.is_mongodb:
            return self.db.find_one(COLLECTION_NAME, {"email": email})
        else:
            row = self.db.execute(
                "SELECT * FROM employees WHERE email = ?",
                (email,),
                fetch_one=True
            )
            return dict(row) if row else None


# Singleton instance
_employee_service: EmployeeService | None = None


def get_employee_service() -> EmployeeService:
    """Get employee service singleton instance."""
    global _employee_service
    if _employee_service is None:
        _employee_service = EmployeeService()
    return _employee_service
