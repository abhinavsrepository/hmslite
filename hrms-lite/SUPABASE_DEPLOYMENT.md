# Supabase Deployment Summary - HRMS Lite

## Why Supabase?

The current deployment uses **SQLite on Vercel's `/tmp`** directory, which is **ephemeral** - all data is lost on every cold start or redeployment. Supabase provides a **free hosted PostgreSQL database** with persistent storage, solving this problem completely.

| Feature | SQLite (Current) | Supabase (Target) |
|---------|-------------------|-------------------|
| Data Persistence | Lost on redeploy | Permanent |
| Concurrent Access | Single writer | Multiple connections |
| Free Tier | N/A | 500 MB, 2 projects |
| Dashboard | None | Full SQL editor + UI |
| Backups | None | Automatic |
| Hosting | Vercel `/tmp` | Supabase Cloud |

---

## Architecture Overview

```
Current:
  Frontend (Vercel CDN) --> API (Vercel Serverless) --> SQLite (/tmp/hrms.db)
                                                        ^ Data lost on cold start

After Migration:
  Frontend (Vercel CDN) --> API (Vercel Serverless) --> Supabase PostgreSQL
                                                        ^ Persistent cloud DB
```

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `hrms-lite`
   - **Database password**: (save this - you'll need it)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for provisioning (~2 minutes)

---

## Step 2: Create Database Tables

Go to **SQL Editor** in the Supabase Dashboard and run:

```sql
-- ============================================
-- HRMS Lite - Supabase Schema
-- ============================================

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    UNIQUE(employee_id, date)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
```

### Key Differences from SQLite

| SQLite | PostgreSQL (Supabase) |
|--------|----------------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT NOW()` |
| No CHECK constraints enforced | `CHECK (status IN (...))` enforced |
| `?` parameter placeholders | `%s` parameter placeholders |

---

## Step 3: Get Connection Details

In Supabase Dashboard, go to **Project Settings > Database**:

You'll need these values:

| Setting | Example Value |
|---------|--------------|
| Host | `db.xxxxxxxxxxxx.supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres` |
| Password | (the one you set in Step 1) |

The full connection string format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

You can also find the pre-built URI under **Project Settings > Database > Connection string > URI**.

---

## Step 4: Code Changes Required

### 4.1 Add `psycopg2` to requirements

**File: `backend/requirements.txt`**
```
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
pydantic[email]>=2.0.0
python-multipart>=0.0.6
email-validator>=2.0.0
python-dotenv>=1.0.0
psycopg2-binary>=2.9.0
```

**File: `api/requirements.txt`** (must match)
```
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
pydantic[email]>=2.0.0
python-multipart>=0.0.6
email-validator>=2.0.0
python-dotenv>=1.0.0
psycopg2-binary>=2.9.0
```

---

### 4.2 Update Configuration

**File: `backend/app/core/config.py`**

Replace the `DB_PATH` field with a `DATABASE_URL` field:

```python
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
        description="Application description"
    )

    # Server
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    DEBUG: bool = Field(default=False, description="Debug mode")
    RELOAD: bool = Field(default=False, description="Auto-reload on code changes")

    # Database
    # Priority: DATABASE_URL env var > Supabase > SQLite fallback
    DATABASE_URL: str = Field(
        default="sqlite:///hrms.db",
        description="Database connection URL (PostgreSQL for Supabase, SQLite for local)"
    )

    # CORS
    CORS_ORIGINS: list[str] = Field(default=["*"], description="Allowed CORS origins")
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True)
    CORS_ALLOW_METHODS: list[str] = Field(default=["*"])
    CORS_ALLOW_HEADERS: list[str] = Field(default=["*"])

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def is_postgres(self) -> bool:
        """Check if using PostgreSQL (Supabase)."""
        return self.DATABASE_URL.startswith("postgresql")

    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite (local dev)."""
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

---

### 4.3 Rewrite Database Layer

**File: `backend/app/db/database.py`**

Replace the entire file to support both SQLite (local) and PostgreSQL (Supabase):

```python
"""
Database connection and session management.
Supports both SQLite (local dev) and PostgreSQL (Supabase production).
"""
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class Database:
    """Database connection manager supporting SQLite and PostgreSQL."""

    def __init__(self):
        self.settings = get_settings()
        self.is_postgres = self.settings.is_postgres

        if self.is_postgres:
            import psycopg2
            self._pg_module = psycopg2
            logger.info(f"Using PostgreSQL (Supabase)")
        else:
            # SQLite fallback for local development
            db_url = self.settings.DATABASE_URL
            self.db_path = db_url.replace("sqlite:///", "")
            self._ensure_directory()
            logger.info(f"Using SQLite: {self.db_path}")

    def _ensure_directory(self) -> None:
        """Ensure the SQLite database directory exists."""
        if not self.is_postgres:
            db_path = Path(self.db_path)
            if db_path.parent != Path("."):
                db_path.parent.mkdir(parents=True, exist_ok=True)

    @contextmanager
    def get_connection(self):
        """Get a database connection."""
        if self.is_postgres:
            conn = self._pg_module.connect(self.settings.DATABASE_URL)
            try:
                yield conn
            finally:
                conn.close()
        else:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            try:
                yield conn
            finally:
                conn.close()

    @contextmanager
    def get_cursor(self):
        """Get a database cursor with auto-commit/rollback."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                yield cursor
                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e

    def execute(self, query, parameters=(), fetch_one=False, fetch_all=False):
        """
        Execute a query and optionally fetch results.
        Automatically converts ? placeholders to %s for PostgreSQL.
        """
        if self.is_postgres:
            query = query.replace("?", "%s")

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, parameters)

            if fetch_one:
                row = cursor.fetchone()
                if row and self.is_postgres:
                    columns = [desc[0] for desc in cursor.description]
                    return dict(zip(columns, row))
                return row
            elif fetch_all:
                rows = cursor.fetchall()
                if rows and self.is_postgres:
                    columns = [desc[0] for desc in cursor.description]
                    return [dict(zip(columns, row)) for row in rows]
                return rows

            conn.commit()
            return None

    def execute_many(self, query, parameters_list):
        """Execute a query with multiple parameter sets."""
        if self.is_postgres:
            query = query.replace("?", "%s")

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, parameters_list)
            conn.commit()


# Global database instance
_db_instance: Database | None = None


def get_database() -> Database:
    """Get the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


@contextmanager
def get_db_connection():
    """Context manager for database connections (backward compatibility)."""
    db = get_database()
    with db.get_connection() as conn:
        yield conn
```

---

### 4.4 Update Database Initialization

**File: `backend/app/db/init_db.py`**

Update the DDL to support both databases:

```python
"""
Database initialization and migration scripts.
"""
from app.db.database import get_database
from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# PostgreSQL DDL (Supabase)
TABLES_POSTGRES = {
    "employees": """
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """,
    "attendance": """
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
            UNIQUE(employee_id, date)
        )
    """,
}

# SQLite DDL (Local development)
TABLES_SQLITE = {
    "employees": """
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """,
    "attendance": """
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            UNIQUE(employee_id, date)
        )
    """,
}

INDEXES = {
    "idx_employees_email": "CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)",
    "idx_employees_department": "CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)",
    "idx_attendance_employee_id": "CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)",
    "idx_attendance_date": "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)",
    "idx_attendance_status": "CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status)",
}


def init_database() -> None:
    """Initialize the database with tables and indexes."""
    settings = get_settings()
    db = get_database()
    tables = TABLES_POSTGRES if settings.is_postgres else TABLES_SQLITE

    logger.info(f"Initializing database ({'PostgreSQL' if settings.is_postgres else 'SQLite'})...")

    with db.get_connection() as conn:
        cursor = conn.cursor()

        for table_name, ddl in tables.items():
            cursor.execute(ddl)
            logger.debug(f"Table '{table_name}' initialized")

        for index_name, ddl in INDEXES.items():
            cursor.execute(ddl)
            logger.debug(f"Index '{index_name}' created")

        conn.commit()

    logger.info("Database initialized successfully")


def reset_database() -> None:
    """Reset the database by dropping all tables. WARNING: Deletes all data!"""
    db = get_database()

    logger.warning("Resetting database - all data will be lost!")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS attendance")
        cursor.execute("DROP TABLE IF EXISTS employees")
        conn.commit()

    logger.info("Database reset complete")
```

---

### 4.5 Update Service Layer for PostgreSQL Compatibility

The service layer uses `dict(row)` to convert SQLite Row objects. With the updated `database.py` returning dicts for PostgreSQL, most services work as-is. However, two methods in the services use `cursor.lastrowid` and direct connection access that need small updates.

**File: `backend/app/services/employee_service.py`**

In the `create_employee` method, the `dict(row)` call works because:
- SQLite: `sqlite3.Row` supports `dict()`
- PostgreSQL: The updated `execute()` returns dicts directly

No changes needed if using `self.db.execute()` consistently.

**File: `backend/app/services/attendance_service.py`**

The `create_attendance` method uses `cursor.lastrowid` which doesn't work in PostgreSQL. Update it to use `RETURNING id`:

```python
# In create_attendance method, replace the INSERT block with:

with self.db.get_connection() as conn:
    cursor = conn.cursor()
    settings = get_settings()

    if settings.is_postgres:
        query = """
            INSERT INTO attendance (employee_id, date, status)
            VALUES (%s, %s, %s) RETURNING id
        """
    else:
        query = """
            INSERT INTO attendance (employee_id, date, status)
            VALUES (?, ?, ?)
        """

    cursor.execute(query, (attendance.employee_id, attendance.date, attendance.status))

    if settings.is_postgres:
        new_id = cursor.fetchone()[0]
    else:
        new_id = cursor.lastrowid

    conn.commit()

    # Fetch created record using self.db.execute
    row = self.db.execute(
        "SELECT * FROM attendance WHERE id = ?",
        (new_id,),
        fetch_one=True
    )
    return AttendanceResponse(**(dict(row) if not isinstance(row, dict) else row))
```

---

### 4.6 Update Health Check

**File: `backend/app/main.py`**

Update the health check to reflect the database type:

```python
@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    import os
    settings = get_settings()
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": "vercel" if os.getenv("VERCEL") else "other",
        "database": "supabase (postgresql)" if settings.is_postgres else "sqlite",
        "timestamp": datetime.now().isoformat()
    }
```

---

## Step 5: Set Environment Variables on Vercel

Go to **Vercel Dashboard > Your Project > Settings > Environment Variables**

Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` | Production |
| `PYTHONUNBUFFERED` | `1` | All |
| `VERCEL` | `1` | All |

**For local development**, create/update `backend/.env`:
```env
# Local development uses SQLite (no Supabase needed)
DATABASE_URL=sqlite:///hrms.db
```

Or to test with Supabase locally:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

---

## Step 6: Deploy

```bash
# Commit all changes
git add .
git commit -m "Migrate from SQLite to Supabase PostgreSQL"
git push origin main
```

Vercel will auto-deploy. The serverless function will now connect to your Supabase PostgreSQL database.

---

## Step 7: Verify Deployment

After deployment, test these URLs:

| Test | URL | Expected |
|------|-----|----------|
| Health Check | `https://your-app.vercel.app/health` | `{"status": "healthy", "database": "supabase (postgresql)"}` |
| API Docs | `https://your-app.vercel.app/docs` | Swagger UI |
| List Employees | `https://your-app.vercel.app/api/employees/` | `[]` (empty array) |
| Dashboard | `https://your-app.vercel.app/api/attendance/dashboard/summary` | `{"total_employees": 0, ...}` |
| Frontend | `https://your-app.vercel.app` | React app loads and displays data |

---

## Files Changed Summary

| File | Change |
|------|--------|
| `backend/requirements.txt` | Added `psycopg2-binary>=2.9.0` |
| `api/requirements.txt` | Added `psycopg2-binary>=2.9.0` |
| `backend/app/core/config.py` | Replaced `DB_PATH` with `DATABASE_URL`, added `is_postgres` property |
| `backend/app/db/database.py` | Rewritten to support both SQLite and PostgreSQL |
| `backend/app/db/init_db.py` | Added PostgreSQL DDL, auto-selects based on `DATABASE_URL` |
| `backend/app/services/attendance_service.py` | Updated `create_attendance` for PostgreSQL `RETURNING` |
| `backend/app/main.py` | Updated health check to show database type |
| Vercel Dashboard | Added `DATABASE_URL` environment variable |

---

## Supabase Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database Size | 500 MB |
| Projects | 2 active |
| API Requests | Unlimited |
| Bandwidth | 5 GB |
| Row-level Security | Included |
| Auto Backups | 7 days |

More than enough for HRMS Lite.

---

## Troubleshooting

### "Connection refused" error
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check Supabase project is active (not paused due to inactivity)
- Ensure password has no special characters that need URL-encoding

### "Relation does not exist" error
- Run the SQL from Step 2 in Supabase SQL Editor
- Verify tables exist in **Table Editor** in Supabase Dashboard

### "psycopg2 not found" error
- Ensure `psycopg2-binary>=2.9.0` is in `api/requirements.txt`
- Redeploy on Vercel after updating requirements

### Data not persisting
- Confirm `DATABASE_URL` starts with `postgresql://` (not `sqlite:///`)
- Check Vercel function logs: `https://vercel.com/dashboard` > Project > Functions > Logs
- Hit `/health` endpoint to verify database type shows `supabase (postgresql)`

### Supabase project paused
- Free tier projects pause after 7 days of inactivity
- Go to Supabase Dashboard and click "Restore" to unpause

---

## Local Development Workflow

```bash
# Option A: Use SQLite locally (default, no setup needed)
cd backend
echo "DATABASE_URL=sqlite:///hrms.db" > .env
python run.py --dev

# Option B: Use Supabase locally (same DB as production)
cd backend
echo "DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres" > .env
python run.py --dev

# Frontend (same for both options)
cd frontend
npm run dev
```

---

## Security Notes

- Never commit `DATABASE_URL` with real credentials to git
- Add `backend/.env` to `.gitignore` (should already be there)
- Supabase connection uses SSL by default
- Consider enabling Row-Level Security (RLS) in Supabase for additional protection
- The `CORS_ORIGINS=["*"]` should be restricted to your Vercel domain in production
