from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from src.services import ldap_service
from src.services.ldap_service import create_user
from src.util.jwt import create_access_token
from src.api.auth_deps import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Literal


router = APIRouter(prefix="/auth", tags=["Authentication"])

# Request Models
class CreateUserRequest(BaseModel):
    first_name: str = Field(examples=["John"])
    last_name: str = Field(examples=["Doe"])
    username: str = Field(examples=["johndoe"])
    password: str = Field(examples=["SecurePass123"])
    group: Literal["user", "admin", "rootadmin"] = Field(examples=["user"])


class LoginRequest(BaseModel):
    username: str
    password: str

# Endpoints
@router.post("/ldap/create", dependencies=[Depends(get_current_user)], summary="Create LDAP User")
def create_ldap_user(user_data: CreateUserRequest):
    """Create a new user in LDAP system"""
    ldap_result = create_user(
        uid=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password=user_data.password,
        group=user_data.group
    )

    return {
        "success": True,
        "ldap_result": ldap_result,
        "message": f"User {user_data.username} created successfully"
    }

@router.delete("/ldap/users/{username}", dependencies=[Depends(get_current_user)])
def delete_user(username: str):
    """Delete LDAP user"""
    ldap_result = ldap_service.delete_user(username)

    return {
        "ldap_result": ldap_result,
        "message": f"User {username} deleted from both LDAP"
    }


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

@router.get("/users", dependencies=[Depends(get_current_user)])
def get_all_users():
    """List all LDAP users"""
    return ldap_service.list_users()
