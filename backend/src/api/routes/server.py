from fastapi import APIRouter

router = APIRouter(tags=["Server"])

# Basic route
@router.get("/", summary="API Status", description="Get basic API information and status")
def root():
    return {"message": "Hello World", "status": "Backend is running"}

@router.get("/health", summary="Health Check", description="Check if the API is healthy and responding")
def health():
    return {"status": "ok"}
