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

To access these services running in Docker containers on the app-server LXC container in Proxmox, use SSH tunneling (Be aware that this requires that you are not running anything locally on your machine using port 3000, 8000, or 8006):

```bash
ssh -L 3000:10.51.33.232:3000 -L 8000:10.51.33.232:8000 -L 8006:10.51.33.138:8006 node0
```

This will forward the ports from the remote server to your local machine, allowing you to access the services using the same local URLs.

You can also add this to your `~/.ssh/config` file for easier tunneling:

```
Host node0-tunnel
    HostName 10.51.33.138
    User root
    LocalForward 3000 10.51.33.232:3000
    LocalForward 8000 10.51.33.232:8000
    LocalForward 8006 10.51.33.138:8006
```

Then you can simply use `ssh node0-tunnel` to establish all the port forwards at once.

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

Note: If you're accessing services running on the app-server LXC container in Proxmox, remember to set up SSH tunneling as described in the Docker section above.

## Deployment

The project is containerized using Docker to ensure consistent deployment across environments:

- All services are defined in the root `docker-compose.yml` file
- Each component has its own Dockerfile with optimized dependencies
- Data persistence is managed through Docker volumes
- Environment variables handle service connections

For production deployment, additional environment variables may need to be configured.

### Accessing the Application on Proxmox

To access the web applications running in Docker containers on the "app-server" LXC in Proxmox:

1. Make sure you are connected to the DTU network or VPN
2. The services are available at the following URLs:
   - Frontend: https://compute.dtu.dk
   - Backend API: https://compute-api.dtu.dk
   - API Documentation: https://compute-api.dtu.dk/docs

For SSH access to the app-server LXC container:
```bash
ssh root@10.51.33.232
```

Alternatively, you can add the following to your `~/.ssh/config` file for easier access to all nodes:
```
Host node0
    HostName 10.51.33.138
    User root

Host node1
    HostName 10.51.33.137
    User root

Host node2
    HostName 10.51.33.143
    User root

Host node3
    HostName 10.51.33.139
    User root

Host node4
    HostName 10.51.33.135
    User root

Host app-server
    HostName 10.51.33.232
    User root

Host node0-tunnel
    HostName 10.51.33.138
    User root
    LocalForward 3000 10.51.33.232:3000
    LocalForward 8000 10.51.33.232:8000
    LocalForward 8006 10.51.33.138:8006
```

This allows you to simply use `ssh app-server` or `ssh node0` to connect to the respective servers, and `ssh node0-tunnel` to establish all port forwards at once.

Once connected, you can check the status of the Docker containers:
```bash
docker ps
docker-compose logs
```

To update and rebuild the server with the latest code from the git repository, simply run:
```bash
rebuild_server
```

This command will:
1. Fetch the latest changes from the git repository
2. Reset the branch to the latest commit on the main branch
3. Run the `rebuild.sh` script to rebuild and restart all Docker containers

The command is available anywhere in the LXC container as it has been added to the system's PATH.

## Features

- LDAP login for secure authentication
- Resource allocation for virtual machines
- Docker image deployment
- Physical sensor access
- Optional USB passthrough
