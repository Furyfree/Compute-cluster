from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import users, auth, admin, server, proxmox, ldap
from src.database import models, database

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

models.Base.metadata.create_all(bind=database.engine)

@app.on_event("startup")
def on_startup():
    from src.util.security import hash_password
    db = database.SessionLocal()
    admin_email = "admin@example.com"
    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    if not existing:
        admin = models.User(
            name="Admin",
            email=admin_email,
            hashed_password=hash_password("admin123"),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("Admin created")
    else:
        print("Admin already exists")
    db.close()

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(server.router)
app.include_router(proxmox.router)
app.include_router(ldap.router)
