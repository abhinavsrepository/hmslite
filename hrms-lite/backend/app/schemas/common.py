"""
Common schemas used across the application.
"""
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    message: str
    data: dict | list | None = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: str | None = None
    code: int | None = None


class HealthCheck(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
