# HRMS Lite - Human Resource Management System

A lightweight, full-stack web application for managing employee records and tracking daily attendance.

## 🚀 Features

### Employee Management
- ✅ Add new employees with unique ID, name, email, and department
- ✅ View complete list of all employees
- ✅ Delete employee records
- ✅ Search employees by name, email, or ID
- ✅ Filter employees by department

### Attendance Management
- ✅ Mark attendance for employees with date and status
- ✅ View attendance records for each employee
- ✅ Filter attendance by date
- ✅ Filter attendance by employee
- ✅ Delete attendance records

### Dashboard
- ✅ Overview statistics (total employees, present, absent)
- ✅ Quick action buttons
- ✅ Recent activity placeholder

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS** - Custom styling

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **SQLite** - Database (production-ready migration to MySQL available)

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hrms-lite
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Initialize the database:

```bash
python init_db.py
```

Start the backend server:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. Setup Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Configure the API URL (optional):

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📡 API Endpoints

### Employees API

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/{employee_id}` - Get specific employee
- `PUT /api/employees/{employee_id}` - Update employee
- `DELETE /api/employees/{employee_id}` - Delete employee

### Attendance API

- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/{employee_id}` - Get employee's attendance
- `GET /api/attendance/summary/{employee_id}` - Get attendance summary for an employee
- `DELETE /api/attendance/{attendance_id}` - Delete attendance record
- `GET /api/attendance/dashboard/summary` - Get dashboard summary

### Health Check

- `GET /` - Root endpoint
- `GET /health` - Health check

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```

### Backend Deployment (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Select the backend directory as the build context
5. Set build command: `venv/Scripts/python init_db.py` (Windows) or `venv/bin/python init_db.py` (Linux/Mac)
6. Set start command: `venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port $PORT` (Windows) or `venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port $PORT` (Linux/Mac)
7. Set environment variables:
   - `PYTHONUNBUFFERED=1`
8. Deploy

### Production Environment Variables

For the backend, set these environment variables in Render:

```env
PYTHONUNBUFFERED=1
```

For the frontend, set in your Vercel project settings:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## 📊 Database Schema

### Employees Table
```sql
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees (id),
    UNIQUE(employee_id, date)
);
```

## 📝 Assumptions & Limitations

### Current Limitations
- Single admin user (no authentication required)
- No leave management system
- No payroll functionality
- No advanced HR features
- Basic CRUD operations only
- No file uploads or document management

### Assumptions
- Employee ID is alphanumeric and at least 4 characters
- Email addresses must be unique
- Attendance records are recorded per date (one record per day per employee)
- Status can only be Present or Absent

## 🔒 Security Considerations

- Email validation on the backend
- Duplicate employee ID and email checks
- Input sanitization
- SQL injection prevention through parameterized queries
- CORS configured for development and production

## 📈 Future Enhancements

- User authentication and authorization
- Leave management system
- Payroll integration
- Advanced reporting and analytics
- Mobile app version
- File upload for documents
- Notification system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the existing documentation

---

**Built with ❤️ using FastAPI and React**