from pydantic import BaseModel
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