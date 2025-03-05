# Compute Cluster Project

A deployment system that gives students access to computing resources and physical sensors through DTU's SSO login.

## About

This project provides a platform where students can access virtual machines and containers for educational purposes without using their own hardware resources. Students can deploy Docker images and interact with physical sensors through a simple web interface.

## Tech Stack

- Backend: Python (FastAPI)
- Frontend: React.js with Next.js
- Infrastructure: Proxmox and Kubernetes
- Database: PostgreSQL
- Authentication: DTU SSO

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

- SSO login for secure authentication
- Resource allocation for virtual machines
- Docker image deployment
- Physical sensor access
- Optional USB passthrough
