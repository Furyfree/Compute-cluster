import httpx
from src.util.env import get_required_env

GUAC_URL = get_required_env("GUACAMOLE_URL")
GUAC_USER = get_required_env("GUACAMOLE_USERNAME")
GUAC_PASS = get_required_env("GUACAMOLE_PASSWORD")

def get_guac_token():
    """"Get guacamole token for user"""
    print(f"GUAC_URL: {GUAC_URL}")
    print(f"GUAC_USER: {GUAC_USER}")
    print(f"Full URL: {GUAC_URL}/api/tokens")

    res = httpx.post(
        f"{GUAC_URL}/api/tokens",
        data={"username": GUAC_USER, "password": GUAC_PASS},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Response status: {res.status_code}")
    res.raise_for_status()
    return res.json()
