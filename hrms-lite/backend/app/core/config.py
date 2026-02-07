"""
Application configuration and settings management.
"""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = Field(default="HRMS Lite API", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    APP_DESCRIPTION: str = Field(
        default="A lightweight Human Resource Management System",
        description="Application description",
    )

    # Server
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    DEBUG: bool = Field(default=False, description="Debug mode")
    RELOAD: bool = Field(default=False, description="Auto-reload on code changes")

    # Database type: sqlite or mongodb
    DB_TYPE: str = Field(
        default="sqlite", description="Database type (sqlite or mongodb)"
    )

    # Database path - Railway uses /data (persistent), Vercel uses /tmp, local uses default
    DB_PATH: str = Field(
        default=(
            "/data/hrms.db"
            if os.getenv("RAILWAY_ENVIRONMENT")
            else "/tmp/hrms.db"
            if os.getenv("VERCEL")
            else "hrms.db"
        ),
        description="SQLite database file path",
    )

    # MongoDB settings (set MONGODB_URI via environment variable or .env file)
    MONGODB_URI: str = Field(
        default="",
        description="MongoDB connection URI",
    )
    MONGODB_DB_NAME: str = Field(default="hrms", description="MongoDB database name")
    MONGODB_COLLECTION_Employees: str = Field(
        default="employees", description="Employees collection name"
    )
    MONGODB_COLLECTION_Attendance: str = Field(
        default="attendance", description="Attendance collection name"
    )
    MONGODB_COLLECTION_Leave: str = Field(
        default="leave", description="Leave collection name"
    )

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "*"],
        description="Allowed CORS origins"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True)
    CORS_ALLOW_METHODS: list[str] = Field(default=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    CORS_ALLOW_HEADERS: list[str] = Field(default=["*"])

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def database_url(self) -> str:
        """Generate database URL."""
        if self.DB_TYPE == "mongodb":
            return f"mongodb+srv://{self.MONGODB_URI}"
        return f"sqlite:///{self.DB_PATH}"

    @property
    def absolute_db_path(self) -> Path:
        """Get absolute path to database file (for SQLite only)."""
        return Path(self.DB_PATH).resolve()


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
