from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date, datetime as dt


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=50)


class EmployeeCreate(EmployeeBase):
    id: str = Field(..., min_length=4, max_length=20)

    @validator("id")
    def validate_id_format(cls, v):
        if not v.isalnum() or len(v) < 4:
            raise ValueError(
                "Employee ID must be alphanumeric and at least 4 characters"
            )
        return v

    @validator("email")
    def validate_email_unique(cls, v, values):
        from db import get_db_connection

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM employees WHERE email = ?", (v,))
            if cursor.fetchone():
                raise ValueError("Email already registered")
        return v


class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, min_length=1, max_length=50)

    @validator("email")
    def validate_email_unique(cls, v):
        if v:
            from db import get_db_connection

            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM employees WHERE email = ?", (v,))
                if cursor.fetchone():
                    raise ValueError("Email already registered")
        return v


class EmployeeResponse(EmployeeBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=4, max_length=20)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: str = Field(..., pattern=r"^(Present|Absent)$")

    @validator("date")
    def validate_date_format(cls, v):
        try:
            dt.datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

    @validator("status")
    def validate_status(cls, v):
        if v not in ["Present", "Absent"]:
            raise ValueError("Status must be Present or Absent")
        return v


class AttendanceUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(Present|Absent)$")


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: str
    status: str


class EmployeeAttendanceSummary(BaseModel):
    employee_id: str
    name: str
    total_present: int = 0
    total_absent: int = 0


class DashboardSummary(BaseModel):
    total_employees: int
    total_present: int
    total_absent: int


from datetime import datetime
