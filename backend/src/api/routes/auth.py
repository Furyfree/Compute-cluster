from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.services import ldap_service
from src.util.jwt import create_access_token
from src.api.auth_deps import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta


router = APIRouter(prefix="/auth", tags=["Authentication"])

# Request Models
class LoginRequest(BaseModel):
    username: str
    password: str

# Endpoints
@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """LDAP login"""
    if not ldap_service.authenticate_user(form_data.username, form_data.password):
        raise HTTPException(status_code=401, detail="Invalid LDAP credentials")

    token, expires_at = create_access_token(
        {"sub": form_data.username, "auth_type": "ldap"},
        expires_delta=timedelta(minutes=30)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at.isoformat(),
        "auth_type": "ldap"
    }

@router.get("/me")
def get_current_user_endpoint(current_user = Depends(get_current_user)):
    """Get current user information"""
    return current_user
