from fastapi import APIRouter, Depends, HTTPException
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

class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(examples=["johndoe2"])

# API
@router.get("/list", dependencies=[Depends(get_current_user)])
def get_all_users():
    """List all users"""
    return ldap_service.list_users()

@router.get("/me", dependencies=[Depends(get_current_user)])
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "success": True,
        "user": current_user
    }

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

@router.patch("/me/change/username", dependencies=[Depends(get_current_user)])
def change_my_username(username_data: UpdateUsernameRequest, current_user: dict = Depends(get_current_user)):
    """Change own username"""
    old_username = current_user["username"]
    ldap_result = ldap_service.change_username(old_username, username_data.new_username)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Username changed from {old_username} to {username_data.new_username}"
    }

@router.patch("/me/change/password", dependencies=[Depends(get_current_user)])
def change_my_password(password_data: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change own password"""
    username = current_user["username"]
    ldap_result = ldap_service.change_password(username, password_data.new_password)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Password changed for user {username}"
    }

@router.delete("/me/delete", dependencies=[Depends(get_current_user)])
def delete_my_account(current_user: dict = Depends(get_current_user)):
    """Delete own account"""
    username = current_user["username"]

    # Prevent admin from accidentally deleting themselves
    if current_user.get("is_admin", False):
        raise HTTPException(status_code=400, detail="Admin users cannot self-delete. Use admin panel instead.")

    ldap_result = ldap_service.delete_user(username)

    return {
        "success": ldap_result.get("success", True) if isinstance(ldap_result, dict) else True,
        "ldap_result": ldap_result,
        "message": f"Account {username} deleted successfully"
    }
