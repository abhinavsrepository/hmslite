"""
Legacy employees router - redirects to the new modular structure.

This module is kept for backward compatibility.
For new development, use `app.api.v1.endpoints.employees` instead.
"""
import warnings

warnings.warn(
    "This module is deprecated. Use 'app.api.v1.endpoints.employees' instead.",
    DeprecationWarning,
    stacklevel=2
)

# Import and re-export from new structure
from app.api.v1.endpoints.employees import router
