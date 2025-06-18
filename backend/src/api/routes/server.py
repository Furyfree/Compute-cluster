from fastapi import APIRouter, Depends
from src.api.auth_deps import get_current_user

router = APIRouter(prefix="/server", tags=["Server"])

# Basic route
@router.get("/", dependencies=[Depends(get_current_user)])
async def root():
    return {"message": "Hello World", "status": "Backend is running"}

@router.get("/health", dependencies=[Depends(get_current_user)])
def health():
    return {"status": "ok"}
