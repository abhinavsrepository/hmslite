"""
Employee API endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.employee import (
    EmployeeCreate, 
    EmployeeResponse, 
    EmployeeUpdate,
    EmployeeListResponse
)
from app.services.employee_service import EmployeeService, get_employee_service
from app.core.exceptions import NotFoundException, DuplicateException
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/employees", tags=["employees"])


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee",
    description="Create a new employee with the provided details"
)
def create_employee(
    employee: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service)
) -> EmployeeResponse:
    """
    Create a new employee.
    
    - **id**: Unique employee ID (alphanumeric, 4-20 chars)
    - **name**: Employee full name (2-100 chars)
    - **email**: Valid email address (must be unique)
    - **department**: Department name (1-50 chars)
    """
    try:
        return service.create_employee(employee)
    except DuplicateException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get(
    "/",
    response_model=List[EmployeeResponse],
    summary="Get all employees",
    description="Retrieve a list of all employees ordered by creation date"
)
def get_employees(
    service: EmployeeService = Depends(get_employee_service)
) -> List[EmployeeResponse]:
    """Get all employees."""
    return service.get_employees()


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get employee by ID",
    description="Retrieve a specific employee by their ID"
)
def get_employee(
    employee_id: str,
    service: EmployeeService = Depends(get_employee_service)
) -> EmployeeResponse:
    """
    Get a single employee by ID.
    
    - **employee_id**: The unique employee identifier
    """
    try:
        return service.get_employee(employee_id)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Update employee",
    description="Update an existing employee's details"
)
def update_employee(
    employee_id: str,
    employee: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service)
) -> EmployeeResponse:
    """
    Update an employee.
    
    - **employee_id**: The employee ID to update
    - **name**: (Optional) New name
    - **email**: (Optional) New email
    - **department**: (Optional) New department
    """
    try:
        return service.update_employee(employee_id, employee)
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


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete employee",
    description="Delete an employee by ID"
)
def delete_employee(
    employee_id: str,
    service: EmployeeService = Depends(get_employee_service)
) -> None:
    """
    Delete an employee.
    
    - **employee_id**: The employee ID to delete
    """
    try:
        service.delete_employee(employee_id)
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
