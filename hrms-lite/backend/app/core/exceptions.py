"""
Custom exceptions for the application.
"""
from fastapi import HTTPException, status


class HRMSException(Exception):
    """Base exception for HRMS application."""
    
    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class DatabaseException(HRMSException):
    """Database-related exceptions."""
    pass


class NotFoundException(HRMSException):
    """Resource not found exception."""
    
    def __init__(self, resource: str = "Resource", identifier: str = ""):
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"
        super().__init__(message)


class DuplicateException(HRMSException):
    """Duplicate resource exception."""
    
    def __init__(self, resource: str = "Resource", field: str = ""):
        message = f"{resource} already exists"
        if field:
            message += f" with this {field}"
        super().__init__(message)


class ValidationException(HRMSException):
    """Validation error exception."""
    pass


# HTTP Exception mappings
def raise_not_found(resource: str = "Resource", identifier: str = ""):
    """Raise HTTP 404 Not Found exception."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=NotFoundException(resource, identifier).message
    )


def raise_duplicate(resource: str = "Resource", field: str = ""):
    """Raise HTTP 409 Conflict exception."""
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=DuplicateException(resource, field).message
    )


def raise_validation_error(message: str):
    """Raise HTTP 422 Unprocessable Entity exception."""
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=message
    )


def raise_internal_error(message: str = "Internal server error"):
    """Raise HTTP 500 Internal Server Error exception."""
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message
    )
