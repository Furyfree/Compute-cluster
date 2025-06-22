from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from src.services import ldap_service
from src.api.auth_deps import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])

# Models
class CreateUserRequest(BaseModel):
    first_name: str = Field(examples=["John"])
    last_name: str = Field(examples=["Doe"])
    username: str = Field(examples=["johndoe"])
    password: str = Field(examples=["SecurePass123"])

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(examples=["OldPass123"])
    new_password: str = Field(examples=["NewPass456"])

class UpdateEmailRequest(BaseModel):
    email: str = Field(examples=["john.doe@example.com"])

class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(examples=["johndoe2"])


@router.get("/", dependencies=[Depends(get_current_user)])
def get_all_users():
    """List all users"""
    return ldap_service.list_users()

@router.post("/create", summary="Create User")
def create_user(user_data: CreateUserRequest):
    """Create a new user"""
    ldap_result = ldap_service.create_user(
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password=user_data.password,
    )

    return {
        "success": True,
        "ldap_result": ldap_result,
        "message": f"User {user_data.username} created successfully"
    }

@router.patch("/{username}/change/password", dependencies=[Depends(get_current_user)])
def change_user_password(username: str, password_data: ChangePasswordRequest):
    """Change user password"""
    ldap_result = ldap_service.change_password(username, password_data.new_password)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Password changed for user {username}"
    }

@router.patch("/{username}/change/username", dependencies=[Depends(get_current_user)])
def change_username(username: str, username_data: UpdateUsernameRequest):
    """Change username"""
    ldap_result = ldap_service.change_username(username, username_data.new_username)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Username changed from {username} to {username_data.new_username}"
    }
