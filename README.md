# Compute Cluster Project

A deployment system that gives students access to computing resources and physical sensors through LDAP login.

## About

This project provides a platform where students can access virtual machines and containers for educational purposes without using their own hardware resources. Students can deploy Docker images and interact with physical sensors through a simple web interface.

## Tech Stack

- Backend: Python (FastAPI)
- Frontend: React.js with Next.js
- Infrastructure: Proxmox and Kubernetes
- Database: PostgreSQL
- Authentication: LDAP
- Deployment: Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose must be installed on your system
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Quick Start with Docker (Recommended)

The entire application stack (frontend, backend, and database) can be started with a single command:

```bash
docker-compose up -d
```

This will:
- Build and start the backend container on port 8000
- Build and start the frontend container on port 3000
- Start a PostgreSQL database container on port 5432
- Configure all necessary connections between services

Once running, you can access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

To stop all containers:

```bash
docker-compose down
```

### Using the rebuild.sh Script (Recommended for Development)

For development, the project includes a convenient rebuild script that handles stopping, removing, rebuilding, and starting all containers when you make changes:

```bash
./rebuild.sh
```

This script will:
1. Stop any running containers
2. Remove the containers
3. Rebuild all images
4. Start everything up again

This is the recommended approach when you've made changes to code and need to quickly rebuild the entire stack.

### Manual Docker Commands

To rebuild containers after code changes:

```bash
docker-compose up -d --build
```

### Manual Development Setup (Alternative)

If you prefer to run components individually for development:

#### Backend

```bash
cd backend
docker-compose up -d  # Only starts the database
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

The backend will be available at:
- API: http://127.0.0.1:8000
- API Documentation: http://127.0.0.1:8000/docs

#### Frontend

First, install Node.js if needed:

**Windows**
```powershell
winget install OpenJS.NodeJS
```
**MacOS**
```bash
brew install node
```

Then start the frontend:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:
- http://localhost:3000

## Deployment

The project is containerized using Docker to ensure consistent deployment across environments:

- All services are defined in the root `docker-compose.yml` file
- Each component has its own Dockerfile with optimized dependencies
- Data persistence is managed through Docker volumes
- Environment variables handle service connections

For production deployment, additional environment variables may need to be configured.

## Features

- LDAP login for secure authentication
- Resource allocation for virtual machines
- Docker image deployment
- Physical sensor access
- Optional USB passthrough
