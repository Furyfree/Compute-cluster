from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from src.api.services import ldap_service
from src.api.services.ldap_service import create_user
from typing import Literal


router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/ldap/create")
def create_ldap_user(
    first_name: str = Form(description="User's first name"),
    last_name: str = Form(description="User's last name"),
    username: str = Form(description="Unique username for login"),
    password: str = Form(description="User password"),
    group: Literal["user", "admin", "rootadmin"] = Form(description="User access level")
):
    ldap_result = create_user(
        uid=username,
        first_name=first_name,
        last_name=last_name,
        password=password,
        group=group
    )

    return {
        "ldap_result": ldap_result,
        "message": f"User {username} created in both LDAP"
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
