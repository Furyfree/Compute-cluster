from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from src.api.auth_deps import get_current_user
from src.services import ldap_service
from typing import Literal

router = APIRouter(prefix="/admin", tags=["Admin"])

class AdminChangePasswordRequest(BaseModel):
    new_password: str = Field(examples=["NewAdminPass123"], description="New password set by admin")

class UpdateGroupRequest(BaseModel):
    group: Literal["test", "admin", "user"] = Field(examples=["admin"])

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

@router.patch("/{username}/change/group", dependencies=[Depends(get_current_user)])
def change_user_group(username: str, group_data: UpdateGroupRequest, current_user: dict = Depends(get_current_user)):
    """Change user group"""
    print(f"DEBUG: Current user = {current_user}")
    print(f"DEBUG: is_admin = {current_user.get('is_admin', False)}")

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    ldap_result = ldap_service.change_group(username, group_data.group)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Group changed for user {username} to {group_data.group}"
    }

@router.delete("/{username}/admin/delete", dependencies=[Depends(get_current_user)])
def delete_user(username: str, current_user: dict = Depends(get_current_user)):
    """Delete user as admin"""
    ldap_result = ldap_service.delete_user(username)

    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    return {
        "ldap_result": ldap_result,
        "message": f"User {username} deleted from LDAP"
    }
