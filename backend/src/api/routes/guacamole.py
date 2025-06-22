from fastapi import APIRouter, Depends
from src.services import guac_service
from src.api.auth_deps import get_current_user
from pydantic import BaseModel, Field

router = APIRouter(prefix="/guacamole", tags=["Guacamole"])

# Models
class CreateSSHConnectionRequest(BaseModel):
    name: str = Field(examples=["App-server"])
    hostname: str = Field(examples=["10.51.32.242"], description="IP address of the server")
    username: str = Field(examples=["app-server"], description="VM login Username")
    password: str = Field(examples=["password123"])
    max_connections: int = Field(default=2, examples=[2])
    max_connections_per_user: int = Field(default=1, examples=[1])

class CreateVNCConnectionRequest(BaseModel):
    name: str = Field(examples=["Linux-Desktop"])
    hostname: str = Field(examples=["10.51.32.242"], description="IP address of the server")
    password: str = Field(examples=["password123"])
    max_connections: int = Field(default=2, examples=[2])
    max_connections_per_user: int = Field(default=1, examples=[1])

class CreateRDPConnectionRequest(BaseModel):
    name: str = Field(examples=["Windows-Desktop"])
    hostname: str = Field(examples=["10.51.32.242"], description="IP address of the server")
    username: str = Field(examples=["username"])
    password: str = Field(examples=["password123"])
    max_connections: int = Field(default=2, examples=[2])
    max_connections_per_user: int = Field(default=1, examples=[1])

# API
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

@router.get("/connections/{connection_id}/url", dependencies=[Depends(get_current_user)], summary="Get Connection URL")
def get_connection_url(connection_id: str):
    return guac_service.get_connection_url(connection_id)

@router.post("/connections/ssh", dependencies=[Depends(get_current_user)], summary="Create SSH connection")
def create_ssh_connection(connection_data: CreateSSHConnectionRequest):
    """Create SSH connection"""
    result = guac_service.create_ssh_connection(
        name=connection_data.name,
        hostname=connection_data.hostname,
        username=connection_data.username,
        password=connection_data.password,
        max_connections=connection_data.max_connections,
        max_connections_per_user=connection_data.max_connections_per_user
    )

    return {
        "success": True,
        "message": f"SSH connection '{connection_data.name}' created successfully",
        "connection": result
    }

@router.post("/connections/vnc", dependencies=[Depends(get_current_user)], summary="Create VNC connection")
def create_vnc_connection(connection_data: CreateVNCConnectionRequest):
    """Create VNC connection"""
    result = guac_service.create_vnc_connection(
        name=connection_data.name,
        hostname=connection_data.hostname,
        password=connection_data.password,
        port=5900,
        max_connections=connection_data.max_connections,
        max_connections_per_user=connection_data.max_connections_per_user
    )

    return {
        "success": True,
        "message": f"VNC connection '{connection_data.name}' created successfully",
        "connection": result
    }

@router.post("/connections/rdp", dependencies=[Depends(get_current_user)], summary="Create RDP connection")
def create_rdp_connection(connection_data: CreateRDPConnectionRequest):
    """Create RDP connection"""
    result = guac_service.create_rdp_connection(
        name=connection_data.name,
        hostname=connection_data.hostname,
        username=connection_data.username,
        password=connection_data.password,
        port=3389,
        max_connections=connection_data.max_connections,
        max_connections_per_user=connection_data.max_connections_per_user
    )

    return {
        "success": True,
        "message": f"VNC connection '{connection_data.name}' created successfully",
        "connection": result
    }

@router.delete("/connections/{connection_id}/delete", dependencies=[Depends(get_current_user)], summary="Delete Connection")
def delete_guacamole_connection(connection_id: str):
    """Delete a Guacamole connection"""
    result = guac_service.delete_connection(connection_id)
    return result
