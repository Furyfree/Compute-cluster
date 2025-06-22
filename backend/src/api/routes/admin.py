from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from src.services import ldap_service
from src.api.auth_deps import get_admin_user
from typing import Literal

router = APIRouter(prefix="/admin", tags=["Admin"])

# Models
class AdminChangePasswordRequest(BaseModel):
    new_password: str = Field(examples=["NewAdminPass123"], description="New password set by admin")

class UpdateGroupRequest(BaseModel):
    group: Literal["test", "admin", "user"] = Field(examples=["admin"])

class AdminCreateUserRequest(BaseModel):
    first_name: str = Field(examples=["John"])
    last_name: str = Field(examples=["Doe"])
    username: str = Field(examples=["johndoe"])
    password: str = Field(examples=["SecurePass123"])
    group: Literal["test", "admin", "user"] = Field(examples=["user"])

class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(examples=["johndoe2"])

# API
@router.get("/users/list", dependencies=[Depends(get_admin_user)])
def admin_list_all_users():
    """Admin list all users with full details"""
    users = ldap_service.list_users()
    detailed_users = []

    for user in users:
        user_info = ldap_service.get_user_info(user["uid"])
        if user_info:
            detailed_users.append(user_info)

    return {
        "success": True,
        "users": detailed_users,
        "total_count": len(detailed_users)
    }

@router.get("/users/{username}", dependencies=[Depends(get_admin_user)])
def admin_get_user_details(username: str):
    """Admin get detailed user info"""
    user_info = ldap_service.get_user_info(username)

    if not user_info:
        raise HTTPException(status_code=404, detail=f"User {username} not found")

    return {
        "success": True,
        "user": user_info
    }

@router.post("/users/create", dependencies=[Depends(get_admin_user)])
def admin_create_user(user_data: AdminCreateUserRequest):
    """Admin create user with any group"""
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
        "message": f"User {user_data.username} created successfully with group {user_data.group}"
    }

@router.patch("/{username}/change/username", dependencies=[Depends(get_admin_user)])
def admin_change_username(username: str, username_data: UpdateUsernameRequest):
    """Admin change any user's username"""
    ldap_result = ldap_service.change_username(username, username_data.new_username)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Username changed by admin from {username} to {username_data.new_username}"
    }

@router.patch("/{username}/change/password", dependencies=[Depends(get_admin_user)])
def admin_change_user_password(username: str, password_data: AdminChangePasswordRequest):
    """Admin change user password (no old password required)"""
    ldap_result = ldap_service.admin_change_password(username, password_data.new_password)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Password changed by admin for user {username}"
    }

@router.patch("/{username}/change/group", dependencies=[Depends(get_admin_user)])
def admin_change_user_group(username: str, group_data: UpdateGroupRequest):
    """Admin change user group"""
    ldap_result = ldap_service.change_group(username, group_data.group)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Group changed by admin for user {username} to {group_data.group}"
    }

@router.delete("/{username}/delete", dependencies=[Depends(get_admin_user)])
def admin_delete_user(username: str):
    """Admin delete any user"""
    ldap_result = ldap_service.delete_user(username)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"User {username} deleted by admin"
    }
