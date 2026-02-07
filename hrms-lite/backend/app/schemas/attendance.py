"""
Pydantic schemas for Attendance-related operations.
"""
from datetime import date as date_type, datetime
from pydantic import BaseModel, Field, field_validator
import re


class AttendanceBase(BaseModel):
    """Base attendance schema with common attributes."""
    employee_id: str = Field(..., min_length=4, max_length=20, description="Employee ID")
    date: date_type = Field(..., description="Attendance date")
    status: str = Field(..., description="Attendance status (Present/Absent)")
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """Validate attendance status."""
        v = v.capitalize()
        if v not in ["Present", "Absent"]:
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v


class AttendanceCreate(BaseModel):
    """Schema for creating a new attendance record."""
    employee_id: str = Field(..., min_length=4, max_length=20)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Date in YYYY-MM-DD format")
    status: str = Field(..., pattern=r"^(Present|Absent)$")
    
    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        """Validate date format."""
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v


class AttendanceUpdate(BaseModel):
    """Schema for updating an attendance record."""
    status: str = Field(..., pattern=r"^(Present|Absent)$")


class AttendanceInDB(BaseModel):
    """Schema representing attendance as stored in database."""
    id: str
    employee_id: str
    date: str
    status: str
    
    class Config:
        from_attributes = True


class AttendanceResponse(AttendanceInDB):
    """Schema for attendance API responses."""
    pass


class AttendanceListResponse(BaseModel):
    """Schema for list of attendance records response."""
    attendance_records: list[AttendanceResponse]
    total: int


class DashboardSummary(BaseModel):
    """Schema for dashboard summary statistics."""
    total_employees: int
    total_present: int
    total_absent: int


class AttendanceFilter(BaseModel):
    """Schema for filtering attendance records."""
    date: date_type | None = None
    employee_id: str | None = None
    status: str | None = None
