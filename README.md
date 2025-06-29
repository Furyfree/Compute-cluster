# Compute Cluster Project

A virtualization platform that provides students with access to VMs and containers through LDAP authentication and web-based management.

## About

This system allows students to access and manage virtual machines and LXC containers running on a Proxmox cluster through a web interface. Users authenticate via LDAP and can control their allocated resources remotely.

## Tech Stack

- **Backend**: FastAPI (Python 3.12)
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Database**: PostgreSQL 16 (stores Guacamole connections)
- **Authentication**: LDAP + JWT tokens
- **Virtualization**: Proxmox VE cluster (5 nodes)
- **Remote Access**: Apache Guacamole
- **Deployment**: Docker Compose

## Infrastructure

- **node0-4**: Proxmox cluster nodes (10.51.33.138, 10.51.33.137, 10.51.33.143, 10.51.33.139, 10.51.33.135)
- **app-server**: Application server (10.51.32.242) - hosts Docker containers
- **ldap-server**: LDAP authentication (10.51.33.17)

## Local Development Setup

### 1. SSH Configuration

Set up SSH access by creating a symlink to the provided SSH config:

```bash
mkdir -p ~/.ssh/config.d/
ln -sf $(pwd)/ssh/config.d/compute-cluster ~/.ssh/config.d/compute-cluster
```

Then add to your `~/.ssh/config`:
```
Include config.d/compute-cluster
```

### 2. Start Development Environment Locally via Docker

#### Prerequisites
- Install Docker and Docker Compose: [Docker Installation Guide](https://docs.docker.com/get-docker/)

Use the rebuild script to start all services:

```bash
./scripts/rebuild.sh
```

This will:
- Stop any running containers
- Remove old containers
- Rebuild all images
- Start the complete stack

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Guacamole: http://localhost:8001/guacamole

### 3. Alternative: Start Development Environment Without Docker

#### Prerequisites

**Node.js (v18+)**
- Windows: `winget install OpenJS.NodeJS`
- macOS: `brew install node` (install Homebrew first: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)
- Manual: [Node.js Installation](https://nodejs.org/)

**Python 3.12+**
- Windows: `winget install Python.Python.3.12`
- macOS: `brew install python@3.12`
- Manual: [Python Installation](https://www.python.org/downloads/)

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Remote Access

### SSH Tunneling

To access services running on the remote app-server:

```bash
ssh node0-tunnel
```

This forwards:
- Port 3000: Frontend (app-server)
- Port 8000: Backend API (app-server)
- Port 8001: Guacamole Web UI (Guacamole container)
- Port 8006: Proxmox Web UI (node0)
- Port 8080: LDAP Admin (ldap-server)

### Direct Server Access

```bash
ssh app-server    # Access application server
ssh node0         # Access Proxmox node0
ssh ldap-server   # Access LDAP server
```

## Production Deployment

### Accessing Services

Once connected via SSH tunneling (`ssh node0-tunnel`), you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Guacamole Web UI**: http://localhost:8001/guacamole
- **Proxmox Web UI**: https://localhost:8006
- **LDAP Admin (phpLDAPadmin)**: http://localhost:8080/phpldapadmin/

### Server Updates and Deployment

#### Using the Rebuild Server Script

On the app-server, use the interactive rebuild script:

```bash
./scripts/rebuild_server.sh
```

or if available as a system command:

```bash
rebuild_server
```

#### What the Script Does

The `rebuild_server.sh` script is an interactive deployment tool that:

1. **Updates the codebase**: Pulls the latest code from the git repository and resets to the main branch
2. **Provides rebuild profiles**: Offers three different deployment options
3. **Handles Docker services**: Stops, rebuilds, and restarts the selected services

#### Rebuild Profiles

The script offers three rebuild profiles:

| Profile | Option | Services | Use Case |
|---------|--------|----------|----------|
| **app** (default) | `1` | Backend + Frontend | Most common updates - application code changes |
| **guacamole** | `2` | Database + Guacamole | When updating remote access or database configurations |
| **full** | `3` | All services | Complete system rebuild or major infrastructure changes |

#### Interactive Usage

When you run the script, it will:

1. Update the git repository
2. Present a menu of rebuild options:
   ```
   Select rebuild profile:
   1) app - Backend + Frontend only (default)
   2) guacamole - Database + Guacamole only
   3) full - All services

   Choose profile [1-3, default: 1]:
   ```

3. Show your selection and ask for confirmation:
   ```
   Selected profile: app (Backend + Frontend)
   Continue? [Y/n]:
   ```

4. Execute the rebuild process:
   - Stop the selected services
   - Rebuild Docker images
   - Start the services again

#### Examples

**Standard application update (most common):**
```bash
./scripts/rebuild_server.sh
# Press Enter to accept default (app profile)
# Press Enter or 'Y' to confirm
```

**Update only database and Guacamole:**
```bash
./scripts/rebuild_server.sh
# Type '2' and press Enter
# Press Enter or 'Y' to confirm
```

**Full system rebuild:**
```bash
./scripts/rebuild_server.sh
# Type '3' and press Enter
# Press Enter or 'Y' to confirm
```

### Docker Management

Check container status:
```bash
docker ps
```

Check individual service logs:
```bash
docker logs compute-cluster-backend
docker logs compute-cluster-frontend
docker logs compute-cluster-db
docker logs compute-cluster-guacd
docker logs compute-cluster-guacamole
```

## Database Schema

PostgreSQL stores:
- Guacamole connection configurations
- VM and container metadata from Proxmox API
- User session data

## Development Workflow

1. Make code changes locally
2. Test with `./scripts/rebuild.sh` for local development
3. Push changes to git repository
4. SSH to app-server: `ssh app-server`
5. Run `./scripts/rebuild_server.sh` and select appropriate profile
6. Verify deployment through the web interfaces

## Authors

Patrick, Frank & Emil
