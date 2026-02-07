# MongoDB Integration for HRMS Lite

This project now supports MongoDB Atlas as a database backend in addition to SQLite.

## Setup Instructions

### 1. Install Dependencies

The MongoDB driver is already included in `requirements.txt`. Install it:

```bash
cd hrms-lite/backend
pip install -r requirements.txt
```

### 2. Configure MongoDB Connection

The MongoDB connection details are already configured in the `.env` file:

- `DB_TYPE=mongodb` - Set to "mongodb" to use MongoDB
- `MONGODB_URI=mongodb+srv://...` - Your MongoDB Atlas connection string
- `MONGODB_DB_NAME=hrms` - Database name in MongoDB
- Collection names are configurable via environment variables

### 3. Using MongoDB in Your Code

The database layer automatically adapts to the chosen database type. You can use the same code patterns regardless of the database:

```python
from app.db.database import get_database

# Get database instance
db = get_database()

# Use MongoDB operations (works with MongoDB)
db.insert_one("employees", {"name": "John Doe", "email": "john@example.com"})
db.find_many("employees", {"status": "active"})

# Use SQLite operations (works with SQLite)
db.execute("SELECT * FROM employees")
db.execute_many("INSERT INTO employees VALUES (?, ?, ?)", [("John", "Doe", 1)])
```

### 4. MongoDB Collections

The following collections will be automatically created:

- `employees` - Employee information
- `attendance` - Attendance records
- `leave` - Leave requests

### 5. Running the Application

```bash
cd hrms-lite/backend
python run.py --dev
```

The application will automatically connect to MongoDB and create necessary indexes on startup.

## Switching Between Databases

To switch from SQLite to MongoDB, simply change the `DB_TYPE` in your `.env` file:

```bash
DB_TYPE=mongodb
```

To switch back to SQLite:

```bash
DB_TYPE=sqlite
```

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas database is configured:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with appropriate permissions
3. Add your application IP address to MongoDB Atlas network access
4. Use the connection string provided by MongoDB Atlas

## Migration Considerations

When switching from SQLite to MongoDB:

- The database schema is different (SQLite uses tables, MongoDB uses collections)
- Use the MongoDB-specific methods (insert_one, find_one, etc.) for MongoDB
- For SQLite, continue using SQL queries via the `execute` method
- The API remains compatible - you don't need to change your code

## Troubleshooting

### Connection Issues

1. Verify your MongoDB URI is correct
2. Check that your IP address is whitelisted in MongoDB Atlas
3. Ensure you have internet connectivity

### Database Not Found

MongoDB Atlas creates the database automatically when you first insert data into it.

### Collection Creation

Collections are created automatically when you first insert documents into them.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_TYPE` | Database type (sqlite/mongodb) | sqlite |
| `MONGODB_URI` | MongoDB connection string | - |
| `MONGODB_DB_NAME` | MongoDB database name | hrms |
| `MONGODB_COLLECTION_Employees` | Employees collection name | employees |
| `MONGODB_COLLECTION_Attendance` | Attendance collection name | attendance |
| `MONGODB_COLLECTION_Leave` | Leave collection name | leave |
