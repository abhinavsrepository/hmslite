# HRMS Lite Frontend

React + Vite frontend for the HRMS Lite application.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

In a separate terminal:

```bash
cd ../backend
python run.py --dev
```

The backend will start on http://localhost:8000

### 3. Start the Frontend Dev Server

```bash
npm run dev
```

The frontend will start on http://localhost:5173

## API Connection

The frontend uses a **Vite proxy** to forward API requests to the backend:

- Frontend URL: `http://localhost:5173`
- Backend URL: `http://localhost:8000`
- API calls from frontend: `/api/employees` → proxied to → `http://localhost:8000/api/employees`

This setup avoids CORS issues during development.

## Environment Variables

Create a `.env` file (already created):

```env
# Empty = use Vite proxy (recommended for development)
VITE_API_URL=

# Or use full URL (will cause CORS issues if backend not configured properly)
# VITE_API_URL=http://localhost:8000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── employees/      # Employee-related components
│   └── attendance/     # Attendance-related components
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Helper utilities
├── config.js           # App configuration
└── App.jsx             # Main application
```

## Troubleshooting

### API Connection Issues

1. Make sure backend is running on port 8000
2. Check browser console for error messages
3. Verify the Vite proxy config in `vite.config.js`

### CORS Errors

If you see CORS errors:
- The Vite proxy should handle this automatically
- Make sure you're using relative URLs (`/api/...`) not absolute URLs

### 500 Errors

Clear Vite cache:
```bash
rm -rf node_modules/.vite
npm run dev
```
