from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import auth, server, proxmox, users, guacamole, admin

app = FastAPI(
    title="Compute Cluster API",
    description="API for managing VMs and containers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(proxmox.router)
app.include_router(guacamole.router)
app.include_router(server.router)
