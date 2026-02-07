"""
HRMS Lite API Application

A lightweight Human Resource Management System API built with FastAPI.
"""
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn

from app.core.config import get_settings
from app.core.logging_config import setup_logging, get_logger
from app.db.init_db import init_database
from app.api.v1.router import api_router


class CORSMiddlewareWithErrors(BaseHTTPMiddleware):
    """Custom CORS middleware that adds headers to all responses including errors."""
    
    def __init__(self, app, allow_origins=None, allow_methods=None, allow_headers=None, allow_credentials=True):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or ["*"]
        self.allow_headers = allow_headers or ["*"]
        self.allow_credentials = allow_credentials
    
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        
        # Determine allowed origin
        if "*" in self.allow_origins:
            allowed_origin = origin or "*"
        else:
            allowed_origin = origin if origin in self.allow_origins else self.allow_origins[0] if self.allow_origins else "*"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = JSONResponse(content={})
            response.headers["Access-Control-Allow-Origin"] = allowed_origin
            response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods) if self.allow_methods != ["*"] else "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers) if self.allow_headers != ["*"] else "*"
            if self.allow_credentials:
                response.headers["Access-Control-Allow-Credentials"] = "true"
            return response
        
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled exception: {exc}", exc_info=True)
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "message": str(exc)}
            )
        
        # Add CORS headers to response
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        if self.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting up HRMS Lite API...")
    try:
        init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down HRMS Lite API...")


def create_application() -> FastAPI:
    """
    Application factory function.
    Creates and configures the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    settings = get_settings()
    
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    
    # Configure CORS with custom middleware that handles errors
    app.add_middleware(
        CORSMiddlewareWithErrors,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
    
    # Include API routers
    app.include_router(api_router)
    
    return app


# Create application instance
app = create_application()


@app.get("/", tags=["root"])
def root():
    """Root endpoint with API information."""
    settings = get_settings()
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "endpoints": {
            "employees": "/api/employees",
            "attendance": "/api/attendance",
            "health": "/health",
            "dashboard": "/api/attendance/dashboard/summary",
        }
    }


@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    import os
    settings = get_settings()
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": "vercel" if os.getenv("VERCEL") else "other",
        "database": settings.DB_PATH,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
