from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from src.api.services import ldap_service
from src.api.services.ldap_service import create_user
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
@router.post("/ldap/create", summary="Create LDAP User")
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

@router.delete("/ldap/users/{username}")
def delete_user(username: str):
    # Slet fra LDAP
    ldap_result = ldap_service.delete_user(username)

    return {
        "ldap_result": ldap_result,
        "message": f"User {username} deleted from both LDAP"
    }


@router.post("/login")
def login_user(data: LoginRequest):
    if ldap_service.authenticate_user(data.username, data.password):
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/users")
def get_all_users():
    return ldap_service.list_users()
