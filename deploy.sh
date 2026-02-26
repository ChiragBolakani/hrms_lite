#!/bin/bash

# HRMS Deployment Script for GCP VM
# This script builds and runs the Docker containers on a GCP VM

set -e

echo "Starting HRMS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
    cat > .env << EOF
# Database Configuration
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-vm-external-ip,your-domain.com
CORS_ALLOWED_ORIGINS=http://your-vm-external-ip,http://your-domain.com

# Frontend Configuration
VITE_API_BASE_URL=http://your-vm-external-ip:8000/api/v1
EOF
    echo -e "${RED}Please edit .env file with your actual values before continuing!${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build and start containers
echo -e "${GREEN}Building Docker images...${NC}"
docker-compose build

echo -e "${GREEN}Starting containers...${NC}"
docker-compose up -d

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker-compose exec -T backend python manage.py migrate --noinput

# Collect static files
echo -e "${GREEN}Collecting static files...${NC}"
docker-compose exec -T backend python manage.py collectstatic --noinput

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Backend is running on port 8000${NC}"
echo -e "${GREEN}Frontend is running on port 80${NC}"

# Show running containers
echo -e "${YELLOW}Running containers:${NC}"
docker-compose ps

