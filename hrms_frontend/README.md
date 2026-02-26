# HRMS Lite Frontend

A professional, production-ready React frontend application for managing departments, employees, and attendance records.

## Tech Stack

- **React** (Vite) - Modern React development with fast HMR
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

## Features

- **Department Management**
  - List all departments with pagination
  - Create new departments
  - Delete departments (with validation)

- **Employee Management**
  - List all employees with pagination
  - Create new employees
  - View employee details
  - Delete employees

- **Attendance Tracking**
  - List attendance records with pagination
  - Filter by employee, start date, and end date
  - Mark attendance (Present/Absent)

## Project Structure

```
hrms_frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (Button, Input, Modal, etc.)
│   │   └── layout/          # Layout components (Header, Sidebar, Layout)
│   ├── pages/               # Page components
│   │   ├── Departments.jsx
│   │   ├── Employees.jsx
│   │   └── Attendance.jsx
│   ├── services/            # API service layer
│   │   └── api.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── hooks/               # Custom React hooks
│   │   └── useApi.js
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind imports
├── public/                  # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd hrms_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

- `VITE_API_BASE_URL` - Base URL for the backend API (default: `http://localhost:8000/api/v1`)

## API Integration

The frontend integrates with the Django REST API backend. All API calls are handled through the service layer in `src/services/api.js`.

### API Endpoints

- **Departments**: `/api/v1/departments/`
- **Employees**: `/api/v1/employees/`
- **Attendance**: `/api/v1/attendance/`

All list endpoints support pagination with `page` and `page_size` query parameters.

## UI States

The application properly handles all UI states:

- **Loading**: Shows spinner during API calls
- **Empty**: Displays helpful message when no data is available
- **Error**: Shows user-friendly error messages with details
- **Success**: Provides feedback for successful operations

## Components

### Common Components

- `Button` - Reusable button with variants (primary, secondary, danger) and loading state
- `Input` - Text input with label and error display
- `Select` - Dropdown select with label and error display
- `Modal` - Reusable modal/dialog component
- `Table` - Data table component
- `LoadingSpinner` - Loading indicator
- `EmptyState` - Empty state message
- `ErrorMessage` - Error display component
- `Pagination` - Pagination controls

### Layout Components

- `Header` - Top navigation bar
- `Sidebar` - Navigation sidebar
- `Layout` - Main layout wrapper

## Responsive Design

The application is fully responsive and works on:
- Desktop (full sidebar navigation)
- Tablet (responsive grid layouts)
- Mobile (stacked layouts, hidden sidebar on small screens)

## Development

### Code Structure

- **Modular**: Components are organized by feature and reusability
- **Readable**: Clear naming conventions and structure
- **Well-structured**: Separation of concerns (components, services, utils)

### Best Practices

- Error handling at API and component levels
- Loading states for all async operations
- Form validation and error display
- Consistent styling with TailwindCSS
- Reusable components to reduce duplication

## Troubleshooting

### API Connection Issues

If you're experiencing API connection issues:

1. Ensure the backend server is running on `http://localhost:8000`
2. Check the `VITE_API_BASE_URL` in your `.env` file
3. Verify CORS settings on the backend allow requests from `http://localhost:3000`

### Build Issues

If the build fails:

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node.js version (should be v16 or higher)

## License

This project is part of the HRMS Lite application.

