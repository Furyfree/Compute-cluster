import httpx
from src.util.env import get_required_env

GUAC_URL = get_required_env("GUACAMOLE_URL")
GUAC_USER = get_required_env("GUACAMOLE_USERNAME")
GUAC_PASS = get_required_env("GUACAMOLE_PASSWORD")
GUAC_EMBED = get_required_env("GUACAMOLE_URL_EMBED")


def get_guac_token():
    """"Get guacamole token for user"""
    res = httpx.post(
        f"{GUAC_URL}/api/tokens",
        data={"username": GUAC_USER, "password": GUAC_PASS},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    res.raise_for_status()
    return res.json()

def get_formatted_token():
    """Get formatted authorization token as headers dictionary"""
    token_data = get_guac_token()
    return {"Guacamole-Token": token_data["authToken"]}

def get_connections():
    """Get all connections"""
    headers = get_formatted_token()
    res = httpx.get(
        f"{GUAC_URL}/api/session/data/postgresql/connections",
        headers=headers
    )
    res.raise_for_status()
    return list(res.json().values())

def get_connection(connection_id: str):
    """Get specific connection details"""
    headers = get_formatted_token()
    res = httpx.get(
        f"{GUAC_URL}/api/session/data/postgresql/connections/{connection_id}",
        headers=headers
    )
    res.raise_for_status()
    return res.json()

def get_connection_url(connection_id: str) -> str:
    """Get direct connection URL for embedding"""
    token_data = get_guac_token()
    auth_token = token_data["authToken"]

    connection_url = f"{GUAC_EMBED}/#/client/{connection_id}?token={auth_token}"
    return connection_url

def create_ssh_connection(
    name: str,
    hostname: str,
    username: str,
    password: str,
    max_connections: int,
    max_connections_per_user: int
):
    """Create SSH connection in Guacamole"""
    headers = get_formatted_token()
    headers["Content-Type"] = "application/json"

    connection_data = {
        "name": name,
        "parentIdentifier": "ROOT",
        "protocol": "ssh",
        "parameters": {
            "hostname": hostname,
            "port": "22",
            "username": username,
            "password": password,
        },
        "attributes": {
            "max-connections": str(max_connections),
            "max-connections-per-user": str(max_connections_per_user)
        }
    }
    res = httpx.post(
        f"{GUAC_URL}/api/session/data/postgresql/connections",
        headers=headers,
        json=connection_data
    )

    if res.status_code == 400:
        response_data = res.json()
        if "already exists" in response_data.get("message", ""):
            return {
                "error": "Connection already exists",
                "message": response_data["message"]
            }
    res.raise_for_status()
    return res.json()

def create_vnc_connection(
    name: str,
    hostname: str,
    password: str,
    port: int,
    max_connections: int,
    max_connections_per_user: int
):
    """Create VNC connection in Guacamole"""
    headers = get_formatted_token()
    headers["Content-Type"] = "application/json"

    connection_data = {
        "name": name,
        "parentIdentifier": "ROOT",
        "protocol": "vnc",
        "parameters": {
            "hostname": hostname,
            "port": str(port),
            "password": password
        },
        "attributes": {
            "max-connections": str(max_connections),
            "max-connections-per-user": str(max_connections_per_user)
        }
    }

    res = httpx.post(
        f"{GUAC_URL}/api/session/data/postgresql/connections",
        headers=headers,
        json=connection_data
    )

    if res.status_code == 400:
        response_data = res.json()
        if "already exists" in response_data.get("message", ""):
            return {
                "error": "Connection already exists",
                "message": response_data["message"]
            }
    res.raise_for_status()
    return res.json()

def create_rdp_connection(
    name: str,
    hostname: str,
    username: str,
    password: str,
    port: int,
    max_connections: int,
    max_connections_per_user: int
):
    """Create RDP connection"""
    headers = get_formatted_token()
    headers["Content-Type"] = "application/json"

    connection_data = {
        "name": name,
        "parentIdentifier": "ROOT",
        "protocol": "rdp",
        "parameters": {
            "hostname": hostname,
            "port": str(port),
            "username": username,
            "password": password
        },
        "attributes": {
            "max-connections": str(max_connections),
            "max-connections-per-user": str(max_connections_per_user)
        }
    }

    res = httpx.post(
        f"{GUAC_URL}/api/session/data/postgresql/connections",
        headers=headers,
        json=connection_data
    )

    if res.status_code == 400:
        response_data = res.json()
        if "already exists" in response_data.get("message", ""):
            return {
                "error": "Connection already exists",
                "message": response_data["message"]
            }
    res.raise_for_status()
    return res.json()

def delete_connection(connection_id: str):
    """Delete a connection from Guacamole"""
    headers = get_formatted_token()

    res = httpx.delete(
        f"{GUAC_URL}/api/session/data/postgresql/connections/{connection_id}",
        headers=headers
    )

    if res.status_code == 404:
        return {
            "error": "Connection not found",
            "message": f"Connection with ID {connection_id} does not exist"
        }
    res.raise_for_status()
    return {"success": True, "message": f"Connection {connection_id} deleted successfully"}

def get_guac_connection_by_name(name: str):
    connections = get_connections()
    for conn in connections:
        if conn.get("name") == name:
            return conn["identifier"]
    raise ValueError(f"No connection found with name '{name}'")

def get_connection_url_by_name(name: str) -> str:
    """Get direct connection URL for embedding, based on connection name"""
    connection_id = get_guac_connection_by_name(name)
    if not connection_id:
        raise ValueError(f"Connection with name '{name}' not found")

    print(f"Connection ID for '{name}': {connection_id}") #debugging line
    token_data = get_guac_token()
    auth_token = token_data["authToken"]

    return f"{GUAC_EMBED}/#/client/{connection_id}?token={auth_token}"