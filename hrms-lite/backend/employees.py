from fastapi import APIRouter, HTTPException, status
from typing import List
from models import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from db import get_db_connection

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO employees (id, name, email, department) VALUES (?, ?, ?, ?)",
                (employee.id, employee.name, employee.email, employee.department),
            )
            conn.commit()

            cursor.execute("SELECT * FROM employees WHERE id = ?", (employee.id,))
            return EmployeeResponse(**cursor.fetchone())
    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee ID already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=List[EmployeeResponse])
def get_employees():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [EmployeeResponse(**row) for row in rows]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )
            return EmployeeResponse(**row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, employee: EmployeeUpdate):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            check_cursor = conn.cursor()
            check_cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
            if check_cursor.fetchone() is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )

            update_data = {
                k: v for k, v in employee.model_dump(exclude_unset=True).items()
            }
            if update_data:
                set_clause = ", ".join([f"{k} = ?" for k in update_data.keys()])
                values = list(update_data.values())
                values.append(employee_id)

                cursor.execute(
                    f"UPDATE employees SET {set_clause} WHERE id = ?", values
                )
                conn.commit()

            cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
            return EmployeeResponse(**cursor.fetchone())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
