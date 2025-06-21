from fastapi import APIRouter, Depends
from src.services import guac_service
from src.api.auth_deps import get_current_user

router = APIRouter(prefix="/guacamole", tags=["Guacamole"])

@router.get("/token", dependencies=[Depends(get_current_user)], summary="Get Guacamole Token")
def get_guac_token():
    return guac_service.get_guac_token()
