# Docker Setup for HRMS

This document explains how to use Docker to run the HRMS application.

## Project Structure

```
HRMS/
├── hrms/                 # Django backend
│   ├── Dockerfile
│   └── ...
├── hrms_frontend/        # React frontend
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml    # Orchestration file
└── .env                  # Environment variables (create from .env.example)
```

## Quick Start

### 1. Create Environment File

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Run Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 4. Create Superuser (Optional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Services

### Backend (Django)
- **Port**: 8000
- **Container**: `hrms_backend`
- **Image**: Built from `hrms/Dockerfile`

### Frontend (React + Nginx)
- **Port**: 80
- **Container**: `hrms_frontend`
- **Image**: Built from `hrms_frontend/Dockerfile`

## Environment Variables

Key environment variables (set in `.env`):

- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` - Database connection
- `SECRET_KEY` - Django secret key (generate a new one for production)
- `DEBUG` - Set to `False` for production
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of CORS origins
- `VITE_API_BASE_URL` - Frontend API base URL (used at build time)

## Development vs Production

### Development
- Set `DEBUG=True` in `.env`
- Frontend uses Vite dev server (not Docker)
- Backend can be run directly with `python manage.py runserver`

### Production
- Set `DEBUG=False` in `.env`
- Use Docker containers
- Set proper `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- Use strong `SECRET_KEY`

## Common Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend python manage.py <command>
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py dbshell

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Database Connection Issues
- Verify database credentials in `.env`
- Ensure database is accessible from Docker network
- Check database firewall rules

### Frontend Can't Reach Backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check nginx configuration
- Ensure backend container is running: `docker-compose ps`

### Port Conflicts
- Change ports in `docker-compose.yml` if 80 or 8000 are in use
- Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly

### Container Won't Start
- Check logs: `docker-compose logs`
- Verify `.env` file exists and has correct values
- Ensure Docker has enough resources allocated

## Building for Production

1. Update `.env` with production values
2. Build images: `docker-compose build`
3. Tag and push to registry (if using):
   ```bash
   docker tag hrms_backend:latest your-registry/hrms_backend:latest
   docker push your-registry/hrms_backend:latest
   ```
4. Deploy to your server (see `GCP_DEPLOYMENT.md`)

## Notes

- The frontend is built at Docker build time, so `VITE_API_BASE_URL` must be set before building
- For production, consider using a reverse proxy (nginx) in front of both services
- Database migrations should be run after starting containers
- Static files are collected automatically in the Dockerfile

