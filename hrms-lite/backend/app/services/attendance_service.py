"""
Attendance service layer for business logic.
Supports both SQLite and MongoDB.
"""
from typing import List
from datetime import date, datetime

from app.db.database import get_database, Database
from app.schemas.attendance import (
    AttendanceCreate, 
    AttendanceUpdate, 
    AttendanceResponse,
    DashboardSummary
)
from app.schemas.employee import EmployeeAttendanceSummary
from app.services.employee_service import EmployeeService, get_employee_service
from app.core.exceptions import (
    NotFoundException,
    DuplicateException,
    raise_not_found,
    raise_duplicate
)
from app.core.logging_config import get_logger

logger = get_logger(__name__)

ATTENDANCE_COLLECTION = "attendance"
EMPLOYEE_COLLECTION = "employees"


class AttendanceService:
    """Service class for attendance operations."""
    
    def __init__(
        self, 
        db: Database | None = None,
        employee_service: EmployeeService | None = None
    ):
        self.db = db or get_database()
        self.employee_service = employee_service or get_employee_service()
    
    def create_attendance(self, attendance: AttendanceCreate) -> AttendanceResponse:
        """
        Create a new attendance record.
        
        Args:
            attendance: Attendance creation data
            
        Returns:
            Created attendance response
            
        Raises:
            NotFoundException: If employee not found
            DuplicateException: If attendance record already exists for date
        """
        # Verify employee exists
        if not self.employee_service.employee_exists(attendance.employee_id):
            raise_not_found("Employee", attendance.employee_id)
        
        if self.db.is_mongodb:
            # MongoDB
            # Check for duplicate entry
            existing = self.db.find_one(
                ATTENDANCE_COLLECTION,
                {"employee_id": attendance.employee_id, "date": attendance.date}
            )
            if existing:
                raise_duplicate("Attendance record", "date")
            
            # Insert attendance
            document = {
                "employee_id": attendance.employee_id,
                "date": attendance.date,
                "status": attendance.status,
                "created_at": datetime.utcnow()
            }
            inserted_id = self.db.insert_one(ATTENDANCE_COLLECTION, document)
            document["id"] = inserted_id
            logger.info(f"Attendance created: {inserted_id}")
            return AttendanceResponse(**document)
        else:
            # SQLite
            # Check for duplicate entry
            existing = self.db.execute(
                """
                SELECT id FROM attendance 
                WHERE employee_id = ? AND date = ?
                """,
                (attendance.employee_id, attendance.date),
                fetch_one=True
            )
            if existing:
                raise_duplicate("Attendance record", "date")
            
            # Insert attendance
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO attendance (employee_id, date, status) 
                    VALUES (?, ?, ?)
                    """,
                    (attendance.employee_id, attendance.date, attendance.status)
                )
                conn.commit()
                new_id = cursor.lastrowid
                
                # Fetch created record
                cursor.execute("SELECT * FROM attendance WHERE id = ?", (new_id,))
                row = cursor.fetchone()
                logger.info(f"Attendance created: {new_id}")
                return AttendanceResponse(**dict(row))
    
    def get_attendance(
        self, 
        filter_date: date | str | None = None
    ) -> List[AttendanceResponse]:
        """
        Get attendance records with optional date filter.
        
        Args:
            filter_date: Optional date filter
            
        Returns:
            List of attendance responses
        """
        if self.db.is_mongodb:
            # MongoDB
            query = {}
            if filter_date:
                query["date"] = str(filter_date)
            docs = self.db.find_many(ATTENDANCE_COLLECTION, query, limit=10000)
            # Convert _id to id if needed
            for doc in docs:
                if "_id" in doc and "id" not in doc:
                    doc["id"] = str(doc.pop("_id"))
            return [AttendanceResponse(**doc) for doc in docs]
        else:
            # SQLite
            if filter_date:
                rows = self.db.execute(
                    "SELECT * FROM attendance WHERE date = ? ORDER BY date DESC",
                    (str(filter_date),),
                    fetch_all=True
                )
            else:
                rows = self.db.execute(
                    "SELECT * FROM attendance ORDER BY date DESC",
                    fetch_all=True
                )
            
            return [AttendanceResponse(**dict(row)) for row in (rows or [])]
    
    def get_employee_attendance(self, employee_id: str) -> List[AttendanceResponse]:
        """
        Get all attendance records for an employee.
        
        Args:
            employee_id: Employee ID
            
        Returns:
            List of attendance responses
            
        Raises:
            NotFoundException: If employee not found
        """
        # Verify employee exists
        if not self.employee_service.employee_exists(employee_id):
            raise_not_found("Employee", employee_id)
        
        if self.db.is_mongodb:
            # MongoDB
            docs = self.db.find_many(
                ATTENDANCE_COLLECTION,
                {"employee_id": employee_id},
                limit=10000
            )
            # Convert _id to id if needed
            for doc in docs:
                if "_id" in doc and "id" not in doc:
                    doc["id"] = str(doc.pop("_id"))
            return [AttendanceResponse(**doc) for doc in docs]
        else:
            # SQLite
            rows = self.db.execute(
                """
                SELECT * FROM attendance 
                WHERE employee_id = ? 
                ORDER BY date DESC
                """,
                (employee_id,),
                fetch_all=True
            )
            return [AttendanceResponse(**dict(row)) for row in (rows or [])]
    
    def get_employee_attendance_summary(
        self, 
        employee_id: str
    ) -> EmployeeAttendanceSummary:
        """
        Get attendance summary for an employee.
        
        Args:
            employee_id: Employee ID
            
        Returns:
            Employee attendance summary
            
        Raises:
            NotFoundException: If employee not found
        """
        # Verify employee exists and get name
        employee = self.employee_service.get_employee(employee_id)
        
        if self.db.is_mongodb:
            # MongoDB - count present and absent
            total_present = self.db.count_documents(
                ATTENDANCE_COLLECTION,
                {"employee_id": employee_id, "status": "Present"}
            )
            total_absent = self.db.count_documents(
                ATTENDANCE_COLLECTION,
                {"employee_id": employee_id, "status": "Absent"}
            )
        else:
            # SQLite
            # Count present days
            present_row = self.db.execute(
                """
                SELECT COUNT(*) as count 
                FROM attendance 
                WHERE employee_id = ? AND status = 'Present'
                """,
                (employee_id,),
                fetch_one=True
            )
            
            # Count absent days
            absent_row = self.db.execute(
                """
                SELECT COUNT(*) as count 
                FROM attendance 
                WHERE employee_id = ? AND status = 'Absent'
                """,
                (employee_id,),
                fetch_one=True
            )
            
            total_present = present_row["count"] if present_row else 0
            total_absent = absent_row["count"] if absent_row else 0
        
        return EmployeeAttendanceSummary(
            employee_id=employee_id,
            name=employee.name,
            total_present=total_present,
            total_absent=total_absent
        )
    
    def update_attendance(
        self,
        attendance_id: str,
        attendance_update: AttendanceUpdate
    ) -> AttendanceResponse:
        """
        Update an attendance record.
        
        Args:
            attendance_id: Attendance record ID
            attendance_update: Update data
            
        Returns:
            Updated attendance response
            
        Raises:
            NotFoundException: If record not found
        """
        if self.db.is_mongodb:
            # MongoDB
            from bson.objectid import ObjectId
            
            # Try to find by ObjectId or string id
            try:
                doc = self.db.find_one(ATTENDANCE_COLLECTION, {"_id": ObjectId(str(attendance_id))})
            except Exception:
                doc = None
            
            if not doc:
                # Try finding by string id field
                doc = self.db.find_one(ATTENDANCE_COLLECTION, {"id": str(attendance_id)})
            
            if not doc:
                raise_not_found("Attendance record", str(attendance_id))
            
            # Update the document
            query_id = {"_id": doc["_id"]} if "_id" in doc else {"id": str(attendance_id)}
            self.db.update_one(
                ATTENDANCE_COLLECTION,
                query_id,
                {"$set": {"status": attendance_update.status}}
            )
            
            logger.info(f"Attendance updated: {attendance_id}")
            
            # Fetch updated record
            updated = self.db.find_one(ATTENDANCE_COLLECTION, query_id)
            if "_id" in updated and "id" not in updated:
                updated["id"] = str(updated.pop("_id"))
            return AttendanceResponse(**updated)
        else:
            # SQLite
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                
                # Update record
                cursor.execute(
                    "UPDATE attendance SET status = ? WHERE id = ?",
                    (attendance_update.status, attendance_id)
                )
                
                if cursor.rowcount == 0:
                    raise_not_found("Attendance record", str(attendance_id))
                
                conn.commit()
                logger.info(f"Attendance updated: {attendance_id}")
                
                # Fetch updated record
                cursor.execute("SELECT * FROM attendance WHERE id = ?", (attendance_id,))
                row = cursor.fetchone()
                return AttendanceResponse(**dict(row))
    
    def delete_attendance(self, attendance_id: str) -> None:
        """
        Delete an attendance record.
        
        Args:
            attendance_id: Attendance record ID
            
        Raises:
            NotFoundException: If record not found
        """
        if self.db.is_mongodb:
            # MongoDB
            from bson.objectid import ObjectId
            
            # Try to find and delete by ObjectId or string id
            result = False
            try:
                result = self.db.delete_one(
                    ATTENDANCE_COLLECTION,
                    {"_id": ObjectId(str(attendance_id))}
                )
            except Exception:
                pass
            
            if not result:
                # Try deleting by string id field
                result = self.db.delete_one(
                    ATTENDANCE_COLLECTION,
                    {"id": str(attendance_id)}
                )
            
            if not result:
                raise_not_found("Attendance record", str(attendance_id))
            
            logger.info(f"Attendance deleted: {attendance_id}")
        else:
            # SQLite
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM attendance WHERE id = ?", (attendance_id,))
                
                if cursor.rowcount == 0:
                    raise_not_found("Attendance record", str(attendance_id))
                
                conn.commit()
                logger.info(f"Attendance deleted: {attendance_id}")
    
    def get_dashboard_summary(self) -> DashboardSummary:
        """
        Get dashboard summary statistics.
        
        Returns:
            Dashboard summary with employee and attendance counts
        """
        if self.db.is_mongodb:
            # MongoDB
            total_employees = self.db.count_documents(EMPLOYEE_COLLECTION)
            total_present = self.db.count_documents(
                ATTENDANCE_COLLECTION,
                {"status": "Present"}
            )
            total_absent = self.db.count_documents(
                ATTENDANCE_COLLECTION,
                {"status": "Absent"}
            )
        else:
            # SQLite
            # Total employees
            employee_row = self.db.execute(
                "SELECT COUNT(*) as count FROM employees",
                fetch_one=True
            )
            
            # Total present
            present_row = self.db.execute(
                "SELECT COUNT(*) as count FROM attendance WHERE status = 'Present'",
                fetch_one=True
            )
            
            # Total absent
            absent_row = self.db.execute(
                "SELECT COUNT(*) as count FROM attendance WHERE status = 'Absent'",
                fetch_one=True
            )
            
            total_employees = employee_row["count"] if employee_row else 0
            total_present = present_row["count"] if present_row else 0
            total_absent = absent_row["count"] if absent_row else 0
        
        return DashboardSummary(
            total_employees=total_employees,
            total_present=total_present,
            total_absent=total_absent
        )


# Singleton instance
_attendance_service: AttendanceService | None = None


def get_attendance_service() -> AttendanceService:
    """Get attendance service singleton instance."""
    global _attendance_service
    if _attendance_service is None:
        _attendance_service = AttendanceService()
    return _attendance_service
