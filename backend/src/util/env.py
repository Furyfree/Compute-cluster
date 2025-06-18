import os

def get_required_env(key: str) -> str:
    """Get required environment variable or raise ValueError"""
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Required environment variable {key} is not set")
    return value
