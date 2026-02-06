@echo off
REM HRMS Lite Backend Setup Script for Windows

echo 🚀 Setting up HRMS Lite Backend...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

echo ✓ Python found:
python --version

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate

REM Upgrade pip
echo 🔧 Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo 🗄️  Initializing database...
python init_db.py

echo ✅ Backend setup complete!
echo.
echo 📚 Next steps:
echo    1. Activate the virtual environment: venv\Scripts\activate
echo    2. Run the server: python -m uvicorn main:app --reload
echo    3. API will be available at: http://localhost:8000
echo    4. Interactive docs at: http://localhost:8000/docs

pause