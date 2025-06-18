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
