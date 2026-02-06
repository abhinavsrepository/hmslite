from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn

from db import init_db
from employees import router as employees_router
from attendance import router as attendance_router

app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight Human Resource Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees_router)
app.include_router(attendance_router)


@app.on_event("startup")
def startup_event():
    init_db()
    print("Database initialized and connected")


@app.get("/")
def root():
    return {
        "message": "HRMS Lite API",
        "version": "1.0.0",
        "endpoints": {
            "employees": "/api/employees",
            "attendance": "/api/attendance",
            "health": "/health",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
