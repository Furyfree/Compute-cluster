from pydantic import BaseModel, Field
from src.models.enums import SupportedOS

class ProvisionRequest(BaseModel):
    username: str
    password: str
    ssh_key: str
    os: SupportedOS

class ProvisionResponse(BaseModel):
    vmid: int
    ip: str | None
    node: str

class GroupRequest(BaseModel):
    group: str

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