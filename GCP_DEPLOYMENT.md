# HRMS GCP VM Deployment Guide

This guide will help you deploy the HRMS application on a Google Cloud Platform (GCP) VM instance.

## Prerequisites

1. A GCP account with billing enabled
2. A remote PostgreSQL database (already configured)
3. Basic knowledge of GCP and Docker

## Step 1: Create a GCP VM Instance

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **Compute Engine** > **VM instances**
3. Click **Create Instance**
4. Configure the instance:
   - **Name**: `hrms-vm` (or your preferred name)
   - **Machine type**: `e2-medium` (2 vCPU, 4 GB memory) or higher
   - **Boot disk**: Ubuntu 22.04 LTS (or latest LTS)
   - **Firewall**: Allow HTTP and HTTPS traffic
5. Click **Create**

## Step 2: Set Up Firewall Rules

1. Go to **VPC network** > **Firewall**
2. Create a new firewall rule:
   - **Name**: `allow-http-https`
   - **Direction**: Ingress
   - **Action**: Allow
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: 
     - TCP: `80` (HTTP)
     - TCP: `443` (HTTPS)
     - TCP: `8000` (Backend API - optional, if you want direct access)

## Step 3: Connect to Your VM

### Using SSH from GCP Console:
1. Click on your VM instance
2. Click **SSH** button

### Using gcloud CLI:
```bash
gcloud compute ssh hrms-vm --zone=YOUR_ZONE
```

## Step 4: Install Docker and Docker Compose on VM

Once connected to your VM, run:

```bash
# Update system packages
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (replace $USER with your username)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and log back in for group changes to take effect
exit
```

Reconnect to your VM after logging out.

## Step 5: Clone Your Repository

```bash
# Install Git if not already installed
sudo apt-get install -y git

# Clone your repository
git clone YOUR_REPOSITORY_URL
cd HRMS
```

Or upload your project files using `gcloud compute scp`:

```bash
# From your local machine
gcloud compute scp --recurse ./HRMS hrms-vm:~/ --zone=YOUR_ZONE
```

## Step 6: Configure Environment Variables

Create a `.env` file in the project root:

```bash
nano .env
```

Add the following configuration (replace with your actual values):

```env
# Database Configuration
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=YOUR_VM_EXTERNAL_IP,your-domain.com
CORS_ALLOWED_ORIGINS=http://YOUR_VM_EXTERNAL_IP,http://your-domain.com

# Frontend Configuration
# Option 1: If using nginx proxy (recommended), use relative path:
VITE_API_BASE_URL=/api/v1
# Option 2: If accessing backend directly, use full URL:
# VITE_API_BASE_URL=http://YOUR_VM_EXTERNAL_IP:8000/api/v1
```

**Important Notes:**
- Replace `YOUR_VM_EXTERNAL_IP` with your VM's external IP (found in GCP Console)
- Generate a secure `SECRET_KEY` using: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- Set `DEBUG=False` for production
- Update `CORS_ALLOWED_ORIGINS` with your actual domain/IP

## Step 7: Update Nginx Configuration

If you're using a custom domain, update `hrms_frontend/nginx.conf`:

```nginx
server_name your-domain.com www.your-domain.com;
```

## Step 8: Build and Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

Or manually:

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## Step 9: Verify Deployment

1. Check if containers are running:
   ```bash
   docker-compose ps
   ```

2. Check logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. Access your application:
   - Frontend: `http://YOUR_VM_EXTERNAL_IP`
   - Backend API: `http://YOUR_VM_EXTERNAL_IP:8000/api/v1`

## Step 10: Set Up SSL (Optional but Recommended)

For production, set up SSL using Let's Encrypt:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Useful Commands

### View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services:
```bash
docker-compose restart
```

### Stop services:
```bash
docker-compose down
```

### Update application:
```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### Access backend shell:
```bash
docker-compose exec backend python manage.py shell
```

### Access database:
```bash
docker-compose exec backend python manage.py dbshell
```

## Troubleshooting

### Containers won't start:
- Check logs: `docker-compose logs`
- Verify `.env` file has correct values
- Ensure database is accessible from VM

### Database connection errors:
- Verify database firewall allows connections from VM's external IP
- Check database credentials in `.env`
- Test connection: `docker-compose exec backend python manage.py dbshell`

### Frontend can't reach backend:
- Check `VITE_API_BASE_URL` in `.env`
- Verify nginx configuration
- Check CORS settings in Django settings

### Port already in use:
- Check what's using the port: `sudo lsof -i :80` or `sudo lsof -i :8000`
- Stop conflicting services or change ports in `docker-compose.yml`

## Security Considerations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong SECRET_KEY** - Generate a new one for production
3. **Set DEBUG=False** - Always in production
4. **Configure ALLOWED_HOSTS** - Only allow your domain/IP
5. **Use HTTPS** - Set up SSL certificate
6. **Database Security** - Use strong passwords and restrict access
7. **Firewall Rules** - Only open necessary ports

## Monitoring and Maintenance

### Set up automatic backups:
- Database backups (if using managed database service)
- Regular container health checks

### Monitor resources:
```bash
# Check container resource usage
docker stats

# Check disk space
df -h
```

## Next Steps

- Set up a custom domain name
- Configure SSL certificate
- Set up monitoring and logging
- Configure automatic backups
- Set up CI/CD pipeline for automated deployments

