from fastapi import APIRouter, Depends
from src.services import guac_service
from src.api.auth_deps import get_current_user

router = APIRouter(prefix="/guacamole", tags=["Guacamole"])

@router.get("/token", dependencies=[Depends(get_current_user)], summary="Get Guacamole Token")
def get_guac_token():
    """"Get guacamole token for user"""
    return guac_service.get_guac_token()

@router.get("/connections", dependencies=[Depends(get_current_user)], summary="Get All Connections")
def get_connections():
    return guac_service.get_connections()

@router.get("/connections/{connection_id}", dependencies=[Depends(get_current_user)], summary="Get Connection Details")
def get_connection(connection_id: str):
    return guac_service.get_connection(connection_id)
