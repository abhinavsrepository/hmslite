#!/bin/bash

# HRMS Lite Backend Setup Script

echo "🚀 Setting up HRMS Lite Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "🔧 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python init_db.py

echo "✅ Backend setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Activate the virtual environment: source venv/bin/activate"
echo "   2. Run the server: python -m uvicorn main:app --reload"
echo "   3. API will be available at: http://localhost:8000"
echo "   4. Interactive docs at: http://localhost:8000/docs"