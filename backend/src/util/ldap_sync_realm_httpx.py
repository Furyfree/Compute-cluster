import httpx
from typing import Literal

def sync_ldap_realm(
    host: str,
    realm: str,
    username: str,
    password: str,
    scope: Literal["users", "groups", "both"] = "both",
    remove_vanished: str = "entry;properties",
    dry_run: bool = False,
    verify_ssl: bool = False
) -> dict:
    """
    Sync a Proxmox LDAP realm using httpx.

    :param host: Proxmox host (e.g. https://proxmox.local:8006)
    :param realm: Name of the LDAP realm (e.g. 'LDAP')
    :param username: Proxmox username (e.g. 'root@pam')
    :param password: Proxmox password
    :param scope: What to sync: 'users', 'groups', or 'both'
    :param remove_vanished: Semicolon-separated removal flags (e.g. 'entry;properties')
    :param dry_run: If True, simulate the sync without applying changes
    :param verify_ssl: Whether to verify SSL certs
    :return: Parsed response JSON from sync
    """

    with httpx.Client(verify=verify_ssl) as client:
        # 1. Authenticate and get ticket and CSRF token
        auth_resp = client.post(
            f"{host}/api2/json/access/ticket",
            data={"username": username, "password": password}
        )
        auth_resp.raise_for_status()
        auth_data = auth_resp.json()["data"]

        ticket = auth_data["ticket"]
        csrf = auth_data["CSRFPreventionToken"]

        # 2. Call the sync API
        headers = {"CSRFPreventionToken": csrf}
        cookies = {"PVEAuthCookie": ticket}

        sync_payload = {
            "scope": scope,
            "remove-vanished": remove_vanished,
        }

        if dry_run:
            sync_payload["dry-run"] = "1"

        sync_resp = client.post(
            f"{host}/api2/json/access/domains/{realm}/sync",
            headers=headers,
            cookies=cookies,
            data=sync_payload
        )
        sync_resp.raise_for_status()
        return sync_resp.json()