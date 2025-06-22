from fastapi import APIRouter, Depends, HTTPException
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

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(examples=["OldPass123"])
    new_password: str = Field(examples=["NewPass456"])

class AdminChangePasswordRequest(BaseModel):
    new_password: str = Field(examples=["NewAdminPass123"], description="New password set by admin")

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

@router.patch("/{username}/change/group", dependencies=[Depends(get_current_user)])
def change_user_group(username: str, group_data: UpdateGroupRequest, current_user: dict = Depends(get_current_user)):
    """Change user group"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    ldap_result = ldap_service.change_group(username, group_data.group)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Group changed for user {username} to {group_data.group}"
    }

@router.patch("/{username}/admin/change/password", dependencies=[Depends(get_current_user)])
def admin_change_user_password(username: str, password_data: AdminChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Admin change user password (no old password required)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    ldap_result = ldap_service.admin_change_password(username, password_data.new_password)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Password changed by admin for user {username}"
    }
