from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import auth, server, proxmox, users, guacamole, admin
import src.services.load_balance_service as load_balance_service
import asyncio

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


async def start_load_balance_service():
    while True:
        await asyncio.to_thread(load_balance_service.rebalance)
        print("Rebalance cycle complete. Waiting for next cycle...")
        await asyncio.sleep(900)  # every 15 minutes

@app.on_event("startup")
async def startup_event():
    print("Starting load balance service...")
    asyncio.create_task(start_load_balance_service())
    print("Load balance service started.")
