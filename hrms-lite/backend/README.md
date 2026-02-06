# HRMS Lite Backend

A lightweight Human Resource Management System API built with FastAPI and SQLite.

## Architecture

The backend follows a modular, layered architecture:

```
app/
├── api/                    # API layer
│   └── v1/                # API version 1
│       ├── endpoints/     # API endpoint handlers
│       │   ├── employees.py
│       │   └── attendance.py
│       └── router.py      # API router configuration
├── core/                  # Core functionality
│   ├── config.py         # Application configuration
│   ├── exceptions.py     # Custom exceptions
│   └── logging_config.py # Logging configuration
├── db/                   # Database layer
│   ├── database.py       # Database connection management
│   └── init_db.py        # Database initialization
├── schemas/              # Pydantic models (data validation)
│   ├── employee.py
│   ├── attendance.py
│   └── common.py
├── services/             # Business logic layer
│   ├── employee_service.py
│   └── attendance_service.py
├── main.py              # Application entry point
└── __init__.py
```

## Features

- **Modular Design**: Clean separation of concerns with dedicated layers
- **Dependency Injection**: FastAPI's dependency system for loose coupling
- **Configuration Management**: Environment-based configuration with pydantic-settings
- **Structured Logging**: Colored console logging with configurable levels
- **Error Handling**: Custom exceptions with proper HTTP status codes
- **Data Validation**: Pydantic schemas for request/response validation
- **Database**: SQLite with connection pooling and transaction support

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Running the Application

```bash
# Run in development mode (with auto-reload)
python run.py --dev

# Run in production mode
python run.py

# Or use uvicorn directly
uvicorn app.main:app --reload
```

### Database Initialization

```bash
# Initialize database
python run.py --init-db

# Reset database (WARNING: deletes all data)
python run.py --reset-db
```

## API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employees/` | Create a new employee |
| GET | `/api/employees/` | Get all employees |
| GET | `/api/employees/{employee_id}` | Get employee by ID |
| PUT | `/api/employees/{employee_id}` | Update employee |
| DELETE | `/api/employees/{employee_id}` | Delete employee |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/` | Create attendance record |
| GET | `/api/attendance/` | Get all attendance records |
| GET | `/api/attendance/?date=YYYY-MM-DD` | Filter by date |
| GET | `/api/attendance/employee/{employee_id}` | Get employee attendance |
| GET | `/api/attendance/summary/{employee_id}` | Get attendance summary |
| PUT | `/api/attendance/{attendance_id}` | Update attendance record |
| DELETE | `/api/attendance/{attendance_id}` | Delete attendance record |
| GET | `/api/attendance/dashboard/summary` | Get dashboard statistics |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI documentation |
| GET | `/redoc` | ReDoc documentation |

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Application
APP_NAME=HRMS Lite API
APP_VERSION=1.0.0
DEBUG=false

# Server
HOST=0.0.0.0
PORT=8000
RELOAD=false

# Database
DB_PATH=hrms.db

# CORS
CORS_ORIGINS=["*"]

# Logging
LOG_LEVEL=INFO
```

## Layer Responsibilities

### API Layer (`app/api/`)
- HTTP request/response handling
- Route definitions
- Input validation (via Depends)
- Output serialization

### Service Layer (`app/services/`)
- Business logic implementation
- Data processing and transformations
- Coordination between multiple data sources
- Transaction management

### Schema Layer (`app/schemas/`)
- Pydantic models for data validation
- Request/response DTOs
- Type definitions

### Database Layer (`app/db/`)
- Database connection management
- Query execution
- Migration scripts

### Core Layer (`app/core/`)
- Application configuration
- Custom exceptions
- Logging setup
- Cross-cutting concerns

## Error Handling

The application uses custom exceptions:

- `NotFoundException`: Resource not found (HTTP 404)
- `DuplicateException`: Resource already exists (HTTP 409)
- `ValidationException`: Invalid data (HTTP 422)
- `DatabaseException`: Database errors (HTTP 500)

## Backward Compatibility

Legacy files at the root level (`main.py`, `db.py`, `employees.py`, `attendance.py`, `models.py`, `init_db.py`) are kept for backward compatibility but are deprecated. They redirect to the new modular structure with deprecation warnings.
