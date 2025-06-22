from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from src.services import ldap_service
from src.api.auth_deps import get_current_user
from typing import Literal

router = APIRouter(prefix="/users", tags=["Users"])

# Models
class CreateUserRequest(BaseModel):
    first_name: str = Field(examples=["John"])
    last_name: str = Field(examples=["Doe"])
    username: str = Field(examples=["johndoe"])
    password: str = Field(examples=["SecurePass123"])
    group: Literal["test"] = Field(examples=["test"])

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(examples=["OldPass123"])
    new_password: str = Field(examples=["NewPass456"])

class UpdateEmailRequest(BaseModel):
    email: str = Field(examples=["john.doe@example.com"])

class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(examples=["johndoe2"])

class UpdateGroupRequest(BaseModel):
    group: Literal["test", "admin", "user"] = Field(examples=["admin"])


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
        group=user_data.group
    )

    return {
        "success": True,
        "ldap_result": ldap_result,
        "message": f"User {user_data.username} created successfully"
    }

@router.delete("/{username}/delete", dependencies=[Depends(get_current_user)])
def delete_user(username: str):
    """Delete user"""
    ldap_result = ldap_service.delete_user(username)

    return {
        "ldap_result": ldap_result,
        "message": f"User {username} deleted from LDAP"
    }

@router.patch("/{username}/password", dependencies=[Depends(get_current_user)])
def change_user_password(username: str, password_data: ChangePasswordRequest):
    """Change user password"""

@router.patch("/{username}/email", dependencies=[Depends(get_current_user)])
def update_user_email(username: str, email_data: UpdateEmailRequest):
    """Update user email"""

@router.patch("/{username}/username", dependencies=[Depends(get_current_user)])
def update_username(username: str, username_data: UpdateUsernameRequest):
    """Update username"""

@router.patch("/{username}/group", dependencies=[Depends(get_current_user)])
def update_user_group(username: str, group_data: UpdateGroupRequest):
    """Update user group"""
