from fastapi import FastAPI
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.database import models, database
from src.util.security import hash_password, verify_password
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.util.auth import create_access_token
from fastapi.security import OAuth2PasswordBearer
from src.util.auth import decode_access_token
from datetime import timedelta
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # ✅ both!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def hello():
    return {"message": "SERVER IS UP AND RUNNING"}

models.Base.metadata.create_all(bind=database.engine)
def create_admin_user():
    db: Session = database.SessionLocal()
    admin_email = "admin@example.com"

    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    if not existing:
        admin_user = models.User(
            name="Admin",
            email=admin_email,
            hashed_password=hash_password("admin123"),  # change later in prod
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin user created")
    else:
        print("ℹ️ Admin user already exists")
create_admin_user()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend"}
class UserCreate(BaseModel):
    name: str
    email: str
    password: str #hasshed_password
@app.post("/users/")
@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}

@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token, expires_at = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=30)  # or however long you want
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at.isoformat()
    }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
@app.get("/me")
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "name": current_user.name
    }
