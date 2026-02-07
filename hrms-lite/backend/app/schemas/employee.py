"""
Pydantic schemas for Employee-related operations.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class EmployeeBase(BaseModel):
    """Base employee schema with common attributes."""
    name: str = Field(..., min_length=2, max_length=100, description="Employee full name")
    email: EmailStr = Field(..., description="Employee email address")
    department: str = Field(..., min_length=1, max_length=50, description="Department name")


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee."""
    id: str = Field(..., min_length=4, max_length=20, description="Unique employee ID")
    
    @field_validator("id")
    @classmethod
    def validate_id_format(cls, v: str) -> str:
        """Validate employee ID format (alphanumeric only)."""
        if not v.isalnum():
            raise ValueError("Employee ID must be alphanumeric")
        return v.upper()  # Normalize to uppercase


class EmployeeUpdate(BaseModel):
    """Schema for updating an existing employee."""
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = Field(None)
    department: str | None = Field(None, min_length=1, max_length=50)


class EmployeeInDB(BaseModel):
    """Schema representing employee as stored in database."""
    id: str = Field(..., description="Unique employee ID")
    name: str = Field(..., description="Employee full name")
    email: str = Field(..., description="Employee email address")
    department: str = Field(..., description="Department name")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    
    class Config:
        from_attributes = True


class EmployeeResponse(BaseModel):
    """Schema for employee API responses."""
    id: str = Field(..., description="Unique employee ID")
    name: str = Field(..., description="Employee full name")
    email: str = Field(..., description="Employee email address")
    department: str = Field(..., description="Department name")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    
    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    """Schema for list of employees response."""
    employees: list[EmployeeResponse]
    total: int


class EmployeeAttendanceSummary(BaseModel):
    """Schema for employee attendance summary."""
    employee_id: str
    name: str
    total_present: int = 0
    total_absent: int = 0
