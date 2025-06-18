from fastapi import APIRouter

router = APIRouter(tags=["Server"])

# Basic route
@router.get("/")
async def root():
    return {"message": "Hello World", "status": "Backend is running"}

@router.get("/health")
def health():
    return {"status": "ok"}
