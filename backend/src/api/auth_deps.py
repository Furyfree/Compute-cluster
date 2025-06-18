from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from src.util.jwt import decode_access_token
from src.services import ldap_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user from JWT token"""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload["sub"]
    user_info = ldap_service.get_user_info(username)
    if not user_info:
        raise HTTPException(status_code=404, detail="LDAP user not found")

    return user_info

def get_admin_user(current_user = Depends(get_current_user)):
    """Require admin or rootadmin permissions"""
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def get_root_admin_user(current_user = Depends(get_current_user)):
    """Require rootadmin permissions only"""
    if "rootadmin" not in current_user.get("groups", []):
        raise HTTPException(status_code=403, detail="Root admin access required")
    return current_user
