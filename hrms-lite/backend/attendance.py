from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from models import (
    AttendanceCreate,
    AttendanceResponse,
    EmployeeAttendanceSummary,
    DashboardSummary,
)
from db import get_db_connection
from datetime import datetime

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post(
    "/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED
)
def create_attendance(attendance: AttendanceCreate):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            check_cursor = conn.cursor()
            check_cursor.execute(
                "SELECT id FROM employees WHERE id = ?", (attendance.employee_id,)
            )
            if check_cursor.fetchone() is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )

            cursor.execute(
                "INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)",
                (attendance.employee_id, attendance.date, attendance.status),
            )
            conn.commit()

            cursor.execute("SELECT * FROM attendance WHERE id = ?", (cursor.lastrowid,))
            return AttendanceResponse(**cursor.fetchone())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=List[AttendanceResponse])
def get_attendance(
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            if date:
                cursor.execute(
                    "SELECT * FROM attendance WHERE date = ? ORDER BY created_at DESC",
                    (date,),
                )
            else:
                cursor.execute("SELECT * FROM attendance ORDER BY created_at DESC")

            rows = cursor.fetchall()
            return [AttendanceResponse(**row) for row in rows]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_employee_attendance(employee_id: str):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            check_cursor = conn.cursor()
            check_cursor.execute(
                "SELECT id FROM employees WHERE id = ?", (employee_id,)
            )
            if check_cursor.fetchone() is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )

            cursor.execute(
                "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC",
                (employee_id,),
            )

            rows = cursor.fetchall()
            return [AttendanceResponse(**row) for row in rows]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/summary/{employee_id}", response_model=EmployeeAttendanceSummary)
def get_employee_attendance_summary(employee_id: str):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            check_cursor = conn.cursor()
            check_cursor.execute(
                "SELECT id FROM employees WHERE id = ?", (employee_id,)
            )
            if check_cursor.fetchone() is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )

            cursor.execute(
                "SELECT COUNT(*) as total_present FROM attendance WHERE employee_id = ? AND status = 'Present'",
                (employee_id,),
            )
            present_row = cursor.fetchone()

            cursor.execute(
                "SELECT COUNT(*) as total_absent FROM attendance WHERE employee_id = ? AND status = 'Absent'",
                (employee_id,),
            )
            absent_row = cursor.fetchone()

            cursor.execute("SELECT name FROM employees WHERE id = ?", (employee_id,))
            name_row = cursor.fetchone()

            return EmployeeAttendanceSummary(
                employee_id=employee_id,
                name=name_row["name"],
                total_present=present_row["total_present"] or 0,
                total_absent=absent_row["total_absent"] or 0,
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM attendance WHERE id = ?", (attendance_id,))
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance record not found",
                )
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*) as total_employees FROM employees")
            employee_row = cursor.fetchone()

            cursor.execute(
                "SELECT COUNT(*) as total_present FROM attendance WHERE status = 'Present'"
            )
            present_row = cursor.fetchone()

            cursor.execute(
                "SELECT COUNT(*) as total_absent FROM attendance WHERE status = 'Absent'"
            )
            absent_row = cursor.fetchone()

            return DashboardSummary(
                total_employees=employee_row["total_employees"] or 0,
                total_present=present_row["total_present"] or 0,
                total_absent=absent_row["total_absent"] or 0,
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
