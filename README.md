# HRMS (Human Resource Management System)

A full-stack Human Resource Management System built with Django REST Framework and React. This application provides functionality for managing employees, departments, and attendance records.

## 🚀 Features

- **Employee Management**: Create, view, and delete employees
- **Department Management**: Manage organizational departments
- **Attendance Tracking**: Record and track employee attendance
- **RESTful API**: Clean and well-structured API endpoints
- **Modern UI**: Responsive React frontend with Tailwind CSS
- **Docker Support**: Containerized for easy deployment

## 🛠️ Tech Stack

### Backend
- **Django** 6.0+ - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Gunicorn** - Production WSGI server

### Frontend
- **React** 19.2+ - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.11 or higher
- **Node.js** 20 or higher and npm
- **PostgreSQL** (or access to a remote PostgreSQL database)
- **Docker** and **Docker Compose** (optional, for containerized setup)
- **Git**

## 🔧 Local Setup

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HRMS
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/api/v1/
   - Admin Panel: http://localhost:8000/admin/

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd hrms
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```bash
   # In hrms directory
   touch .env
   ```
   
   Add the following to `.env`:
   ```env
   DB_NAME=hrms_lite
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at: http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd hrms_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```bash
   # If you want to override the default API URL
   echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:3000

## 📚 API Endpoints

All API endpoints are prefixed with `/api/v1/`.

### Departments

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/v1/departments/` | List all departments | - | Paginated list of departments |
| `GET` | `/api/v1/departments/{id}/` | Get department details | - | Department object |
| `POST` | `/api/v1/departments/` | Create a new department | `{"name": "string"}` | Created department (201) |
| `DELETE` | `/api/v1/departments/{id}/` | Delete a department | - | No content (204) or error if employees exist (409) |

**Query Parameters (for GET `/api/v1/departments/`):**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 50, max: 100)

**Example Request:**
```bash
POST /api/v1/departments/
Content-Type: application/json

{
  "name": "Engineering"
}
```

### Employees

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/v1/employees/` | List all employees | - | Paginated list of employees |
| `GET` | `/api/v1/employees/{id}/` | Get employee details | - | Employee object |
| `POST` | `/api/v1/employees/` | Create a new employee | See below | Created employee (201) |
| `DELETE` | `/api/v1/employees/{id}/` | Delete an employee | - | No content (204) |

**Query Parameters (for GET `/api/v1/employees/`):**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 50, max: 100)

**Request Body (POST `/api/v1/employees/`):**
```json
{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": 1
}
```

**Response Fields:**
- `id` - Employee ID (read-only)
- `employee_id` - Unique employee identifier
- `full_name` - Employee's full name
- `email` - Employee's email address
- `department` - Department ID
- `department_name` - Department name (read-only)
- `created_at` - Creation timestamp (read-only)
- `updated_at` - Last update timestamp (read-only)

**Example Request:**
```bash
POST /api/v1/employees/
Content-Type: application/json

{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": 1
}
```

### Attendance

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/v1/employees/{employee_id}/attendance/` | List attendance records for an employee | - | Paginated list of attendance records |
| `POST` | `/api/v1/employees/{employee_id}/attendance/` | Create attendance record | See below | Created attendance (201) |
| `DELETE` | `/api/v1/employees/{employee_id}/attendance/{id}/` | Delete attendance record | - | No content (204) |

**Query Parameters (for GET `/api/v1/employees/{employee_id}/attendance/`):**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 50, max: 100)
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)

**Request Body (POST `/api/v1/employees/{employee_id}/attendance/`):**
```json
{
  "date": "2024-01-15",
  "status": "PRESENT"
}
```

**Status Values:**
- `PRESENT` - Employee was present
- `ABSENT` - Employee was absent

**Response Fields:**
- `id` - Attendance record ID (read-only)
- `employee` - Employee ID (read-only)
- `employee_id` - Employee identifier (read-only)
- `employee_name` - Employee's full name (read-only)
- `employee_email` - Employee's email (read-only)
- `date` - Attendance date
- `status` - Attendance status (PRESENT/ABSENT)
- `created_at` - Creation timestamp (read-only)

**Example Request:**
```bash
POST /api/v1/employees/EMP001/attendance/
Content-Type: application/json

{
  "date": "2024-01-15",
  "status": "PRESENT"
}
```

## 📁 Project Structure

```
HRMS/
├── hrms/                      # Django backend
│   ├── employees/            # Main app
│   │   ├── api/              # API layer
│   │   │   ├── serializers/  # Data serializers
│   │   │   ├── views/         # API views
│   │   │   └── urls.py       # URL routing
│   │   ├── models.py         # Database models
│   │   └── migrations/        # Database migrations
│   ├── hrms/                 # Django project settings
│   │   ├── settings.py       # Configuration
│   │   └── urls.py           # Root URL config
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Backend container
│   └── manage.py             # Django management script
│
├── hrms_frontend/            # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── utils/            # Utility functions
│   ├── package.json          # Node dependencies
│   ├── Dockerfile            # Frontend container
│   └── nginx.conf            # Nginx configuration
│
├── docker-compose.yml        # Docker orchestration
├── deploy.sh                 # Deployment script
└── README.md                 # This file
```

## 🔐 Environment Variables

### Backend (.env in `hrms/` directory)

```env
# Database Configuration
DB_NAME=hrms_lite
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env in `hrms_frontend/` directory)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

### Backend Tests
```bash
cd hrms
python manage.py test
```

### Frontend Tests
```bash
cd hrms_frontend
npm test
```

## 🚢 Deployment

For deployment instructions, see:
- [Docker Deployment Guide](docs/README_DOCKER.md)
- [GCP VM Deployment Guide](docs/GCP_DEPLOYMENT.md)

## 📝 API Response Format

### Success Response
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/employees/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "department": 1,
      "department_name": "Engineering",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Error Response
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["An employee with this email already exists."]
  }
}
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify database credentials in `.env`
- Ensure PostgreSQL is running
- Check database firewall rules (for remote databases)

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` in settings.py
- Ensure frontend URL is included in allowed origins

### Port Already in Use
- Change ports in `docker-compose.yml` or
- Stop the service using the port

### Migration Issues
```bash
# Reset migrations (development only)
python manage.py migrate --run-syncdb
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework team
- React team
- All contributors

