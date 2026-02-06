"""
Legacy models module - redirects to the new modular structure.

This module is kept for backward compatibility.
For new development, use `app.schemas` instead.
"""
import warnings

warnings.warn(
    "This module is deprecated. Use 'app.schemas' instead.",
    DeprecationWarning,
    stacklevel=2
)

# Import and re-export from new structure
from app.schemas.employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse as EmployeeInDB,
)
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse as AttendanceInDB,
    EmployeeAttendanceSummary,
    DashboardSummary,
)

# Re-export with old names for compatibility
EmployeeResponse = EmployeeInDB
AttendanceResponse = AttendanceInDB
