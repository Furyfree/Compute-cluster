from ldap3 import SUBTREE
from ldap3.core.exceptions import LDAPBindError
from dotenv import load_dotenv
from src.util.env import get_required_env
from src.util.ldap_connection import get_admin_connection, get_user_connection

load_dotenv()

LDAP_BASE_DN = get_required_env("LDAP_BASE_DN")
GROUP_GID_MAPPING = {
    "test": "501"
}

def create_user(username: str, first_name: str, last_name: str, password: str, group: str):
    """Create a new user in LDAP"""
    with get_admin_connection() as conn:
        full_name = f"{first_name} {last_name}"
        dn = f"cn={full_name},{LDAP_BASE_DN}"
        uid_number = get_next_uid()
        gid = GROUP_GID_MAPPING.get(group, "500")

        entry = {
            "objectClass": ["inetOrgPerson", "posixAccount", "top"],
            "cn": full_name,
            "sn": last_name,
            "givenName": first_name,
            "uid": username,
            "uidNumber": str(uid_number),
            "gidNumber": gid,
            "homeDirectory": f"/home/users/{username}",
            "userPassword":  password,
        }

        conn.add(dn, attributes=entry)
        return conn.result

def delete_user(username: str):
    """Delete user from LDAP"""
    with get_admin_connection() as conn:
        conn.search(LDAP_BASE_DN, f"(uid={username})", attributes=[])
        if conn.entries:
            user_dn = conn.entries[0].entry_dn
            conn.delete(user_dn)
        return conn.result

def get_next_uid():
    """Find next available UID"""
    with get_admin_connection() as conn:
        conn.search(
            search_base=LDAP_BASE_DN,
            search_filter="(objectClass=posixAccount)",
            search_scope=SUBTREE,
            attributes=["uidNumber"]
        )
        used_uids = sorted([int(entry.uidNumber.value) for entry in conn.entries])
        return used_uids[-1] + 1 if used_uids else 1000

def authenticate_user(username: str, password: str) -> bool:
    """Authenticate user against LDAP"""
    if not username or not password:
        return False

    with get_admin_connection() as conn:
        conn.search(LDAP_BASE_DN, f"(uid={username})", attributes=[])
        if not conn.entries:
            return False
        user_dn = conn.entries[0].entry_dn

    try:
        with get_user_connection(user_dn, password):
            return True
    except LDAPBindError:
        return False

def list_users():
    """List all users in LDAP"""
    with get_admin_connection() as conn:
        conn.search(
            search_base=LDAP_BASE_DN,
            search_filter="(objectClass=inetOrgPerson)",
            search_scope=SUBTREE,
            attributes=[]
        )
        return [
            {
                "cn": entry.cn.value if hasattr(entry, "cn") else "",
                "uid": entry.uid.value if hasattr(entry, "uid") else "",
                "first_name": entry.givenName.value if hasattr(entry, "givenName") else "",
                "last_name": entry.sn.value if hasattr(entry, "sn") else "",
            }
            for entry in conn.entries
        ]

def get_user_info(username: str):
    """Get detailed info for a specific LDAP user"""
    with get_admin_connection() as conn:
        conn.search(LDAP_BASE_DN, f"(uid={username})", attributes=[])

        if not conn.entries:
            return None

        user_entry = conn.entries[0]

        return {
            "username": user_entry.uid.value if hasattr(user_entry, "uid") else "",
            "name": user_entry.cn.value if hasattr(user_entry, "cn") else "",
            "first_name": user_entry.givenName.value if hasattr(user_entry, "givenName") else "",
            "last_name": user_entry.sn.value if hasattr(user_entry, "sn") else "",
            "email": user_entry.mail.value if hasattr(user_entry, "mail") else "",
            "home_directory": user_entry.homeDirectory.value if hasattr(user_entry, "homeDirectory") else "",
            "uid_number": user_entry.uidNumber.value if hasattr(user_entry, "uidNumber") else "",
            "gid_number": user_entry.gidNumber.value if hasattr(user_entry, "gidNumber") else "",
            "is_admin": user_entry.gidNumber.value == "501" if hasattr(user_entry, "gidNumber") else False
        }
