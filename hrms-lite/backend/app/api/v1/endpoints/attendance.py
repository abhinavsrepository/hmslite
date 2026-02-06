"""
Attendance API endpoints.
"""
from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceUpdate,
    DashboardSummary
)
from app.schemas.employee import EmployeeAttendanceSummary
from app.services.attendance_service import AttendanceService, get_attendance_service
from app.core.exceptions import NotFoundException, DuplicateException
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post(
    "/",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create attendance record",
    description="Mark attendance for an employee on a specific date"
)
def create_attendance(
    attendance: AttendanceCreate,
    service: AttendanceService = Depends(get_attendance_service)
) -> AttendanceResponse:
    """
    Create a new attendance record.
    
    - **employee_id**: Employee ID (must exist)
    - **date**: Date in YYYY-MM-DD format
    - **status**: Present or Absent
    """
    try:
        return service.create_attendance(attendance)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except DuplicateException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get(
    "/",
    response_model=List[AttendanceResponse],
    summary="Get attendance records",
    description="Get all attendance records with optional date filter"
)
def get_attendance(
    filter_date: date | None = Query(
        None, 
        alias="date",
        description="Filter by date (YYYY-MM-DD)"
    ),
    service: AttendanceService = Depends(get_attendance_service)
) -> List[AttendanceResponse]:
    """
    Get attendance records.
    
    - **date**: (Optional) Filter by specific date
    """
    return service.get_attendance(filter_date)


@router.get(
    "/employee/{employee_id}",
    response_model=List[AttendanceResponse],
    summary="Get employee attendance",
    description="Get all attendance records for a specific employee"
)
def get_employee_attendance(
    employee_id: str,
    service: AttendanceService = Depends(get_attendance_service)
) -> List[AttendanceResponse]:
    """
    Get attendance records for a specific employee.
    
    - **employee_id**: The employee ID
    """
    try:
        return service.get_employee_attendance(employee_id)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "/summary/{employee_id}",
    response_model=EmployeeAttendanceSummary,
    summary="Get employee attendance summary",
    description="Get attendance summary statistics for an employee"
)
def get_employee_attendance_summary(
    employee_id: str,
    service: AttendanceService = Depends(get_attendance_service)
) -> EmployeeAttendanceSummary:
    """
    Get attendance summary for an employee.
    
    Returns total present and absent days.
    
    - **employee_id**: The employee ID
    """
    try:
        return service.get_employee_attendance_summary(employee_id)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Update attendance record",
    description="Update an existing attendance record"
)
def update_attendance(
    attendance_id: int,
    attendance: AttendanceUpdate,
    service: AttendanceService = Depends(get_attendance_service)
) -> AttendanceResponse:
    """
    Update an attendance record.
    
    - **attendance_id**: The attendance record ID
    - **status**: New status (Present or Absent)
    """
    try:
        return service.update_attendance(attendance_id, attendance)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete attendance record",
    description="Delete an attendance record by ID"
)
def delete_attendance(
    attendance_id: int,
    service: AttendanceService = Depends(get_attendance_service)
) -> None:
    """
    Delete an attendance record.
    
    - **attendance_id**: The attendance record ID to delete
    """
    try:
        service.delete_attendance(attendance_id)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "/dashboard/summary",
    response_model=DashboardSummary,
    summary="Get dashboard summary",
    description="Get overall dashboard statistics"
)
def get_dashboard_summary(
    service: AttendanceService = Depends(get_attendance_service)
) -> DashboardSummary:
    """Get dashboard summary with overall statistics."""
    return service.get_dashboard_summary()
