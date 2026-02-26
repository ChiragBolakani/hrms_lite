# HRMS Docker Deployment

This project is now dockerized and ready for deployment on GCP VM or any Docker-compatible environment.

## Files Created

### Docker Configuration
- `hrms/Dockerfile` - Django backend container
- `hrms_frontend/Dockerfile` - React frontend container (multi-stage build)
- `hrms/.dockerignore` - Backend ignore patterns
- `hrms_frontend/.dockerignore` - Frontend ignore patterns
- `docker-compose.yml` - Service orchestration
- `hrms_frontend/nginx.conf` - Nginx configuration for frontend

### Deployment Files
- `deploy.sh` - Deployment script for GCP VM
- `GCP_DEPLOYMENT.md` - Complete GCP deployment guide
- `DOCKER_README.md` - Docker usage documentation
- `.env.example` - Environment variables template

### Updated Files
- `hrms/requirements.txt` - Added gunicorn and django-cors-headers
- `hrms/hrms/settings.py` - Updated for production with environment variables

## Quick Start

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/api/v1

## Key Features

- ✅ Multi-stage Docker builds for optimized images
- ✅ Nginx serving frontend and proxying API requests
- ✅ Environment-based configuration
- ✅ Production-ready Django settings
- ✅ Remote database support (as you're already using)
- ✅ CORS configuration
- ✅ Gunicorn for Django production server

## For GCP Deployment

See `GCP_DEPLOYMENT.md` for detailed instructions on deploying to GCP VM.

## Important Notes

1. **Environment Variables**: Always set proper values in `.env` file:
   - Generate a new `SECRET_KEY` for production
   - Set `DEBUG=False` for production
   - Configure `ALLOWED_HOSTS` with your domain/IP
   - Set `VITE_API_BASE_URL=/api/v1` when using nginx proxy

2. **Database**: Since you're using a remote database, ensure:
   - Database firewall allows connections from your VM's IP
   - Database credentials are correct in `.env`

3. **Security**:
   - Never commit `.env` file (already in `.gitignore`)
   - Use strong passwords
   - Enable HTTPS in production
   - Set proper firewall rules

## Next Steps

1. Test locally with `docker-compose up`
2. Create GCP VM instance
3. Follow `GCP_DEPLOYMENT.md` for deployment
4. Set up SSL certificate (Let's Encrypt)
5. Configure monitoring and backups

