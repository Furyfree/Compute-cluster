import httpx
from src.util.env import get_required_env

GUAC_URL = get_required_env("GUACAMOLE_URL")
GUAC_USER = get_required_env("GUACAMOLE_USERNAME")
GUAC_PASS = get_required_env("GUACAMOLE_PASSWORD")

def get_guac_token():
    res = httpx.post(
        f"{GUAC_URL}/api/tokens",
        data={"username": GUAC_USER, "password": GUAC_PASS},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    res.raise_for_status()
    return res.json()
