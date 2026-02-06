"""
Entry point for running the HRMS Lite API.

Usage:
    python run.py              # Run production server
    python run.py --dev        # Run development server with auto-reload
    python run.py --init-db    # Initialize database only
"""
import argparse
import sys

import uvicorn

from app.core.config import get_settings
from app.core.logging_config import setup_logging, get_logger
from app.db.init_db import init_database, reset_database


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="HRMS Lite API")
    parser.add_argument(
        "--dev", 
        action="store_true", 
        help="Run in development mode with auto-reload"
    )
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Initialize database and exit"
    )
    parser.add_argument(
        "--reset-db",
        action="store_true",
        help="Reset database (WARNING: deletes all data)"
    )
    parser.add_argument(
        "--host",
        default=None,
        help="Server host (default: from config)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="Server port (default: from config)"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging()
    logger = get_logger(__name__)
    
    # Handle database commands
    if args.reset_db:
        logger.warning("Resetting database...")
        reset_database()
        print("[OK] Database reset complete")
        return
    
    if args.init_db:
        logger.info("Initializing database...")
        init_database()
        print("[OK] Database initialized successfully!")
        return
    
    # Get settings
    settings = get_settings()
    host = args.host or settings.HOST
    port = args.port or settings.PORT
    reload = args.dev or settings.RELOAD
    
    # Log startup info
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Server: http://{host}:{port}")
    logger.info(f"Docs: http://{host}:{port}/docs")
    logger.info(f"Mode: {'development' if reload else 'production'}")
    
    # Run server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=settings.LOG_LEVEL.lower()
    )


if __name__ == "__main__":
    main()
