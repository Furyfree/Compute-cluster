import os
from ldap3 import Server, Connection, ALL, SUBTREE, MODIFY_DELETE, MODIFY_REPLACE
from dotenv import load_dotenv

load_dotenv()

LDAP_HOST = os.getenv("LDAP_HOST")
LDAP_BASE_DN = os.getenv("LDAP_BASE_DN")
LDAP_ADMIN_DN = os.getenv("LDAP_ADMIN_DN")
LDAP_ADMIN_PASSWORD = os.getenv("LDAP_ADMIN_PASSWORD")

server = Server(LDAP_HOST, get_info=ALL)

def create_user(uid: str, first_name: str, last_name: str, password: str, group: str):
    dn = f"uid={uid},{LDAP_BASE_DN}"  # Brug uid i stedet for cn
    uid_number = get_next_uid()
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)

    entry = {
        "objectClass": ["inetOrgPerson", "posixAccount", "top"],
        "cn": f"{first_name} {last_name}",
        "sn": last_name,
        "givenName": first_name,
        "uid": uid,
        "uidNumber": str(uid_number),
        "gidNumber": "500",  # standard users group
        "homeDirectory": f"/home/users/{uid}",
        "userPassword": password,
    }

    conn.add(dn, attributes=entry)

    # Tilføj til gruppe
    group_dn = f"cn={group},ou=groups,{LDAP_BASE_DN}"
    conn.modify(group_dn, {
        "member": [(MODIFY_REPLACE, [dn])]
    })

    return conn.result

def delete_user(username: str):
    """Delete user from LDAP"""
    user_dn = f"uid={username},{LDAP_BASE_DN}"
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)

    # Fjern fra alle grupper først
    conn.search(
        search_base=f"ou=groups,{LDAP_BASE_DN}",
        search_filter="(objectClass=groupOfNames)",
        search_scope=SUBTREE,
        attributes=["member"]
    )

    for entry in conn.entries:
        if user_dn in entry.member.values:
            group_dn = entry.entry_dn
            conn.modify(group_dn, {
                "member": [(MODIFY_DELETE, [user_dn])]
            })

    # Slet bruger
    conn.delete(user_dn)
    return conn.result

def get_next_uid():
    """Find next available UID"""
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
    conn.search(
        search_base=LDAP_BASE_DN,
        search_filter="(objectClass=posixAccount)",
        search_scope=SUBTREE,
        attributes=["uidNumber"]
    )
    used_uids = sorted([int(entry.uidNumber.value) for entry in conn.entries])
    return used_uids[-1] + 1 if used_uids else 1000

def authenticate_user(username: str, password: str) -> bool:
    user_dn = f"uid={username},{LDAP_BASE_DN}"  # Brug uid i stedet for cn
    try:
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        return True
    except Exception:
        return False


def list_users():
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
    conn.search(
        search_base=LDAP_BASE_DN,
        search_filter="(objectClass=inetOrgPerson)",
        search_scope=SUBTREE,
        attributes=["cn", "uid", "givenName", "sn"]
    )
    return [
        {
            "cn": entry.cn.value,
            "uid": entry.uid.value,
            "first_name": entry.givenName.value,
            "last_name": entry.sn.value,
        }
        for entry in conn.entries
    ]

def get_user_info(username: str):
    """Get detailed info for a specific LDAP user"""
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
    user_dn = f"uid={username},{LDAP_BASE_DN}"

    # Search for the specific user
    conn.search(
        search_base=user_dn,
        search_filter="(objectClass=inetOrgPerson)",
        search_scope=SUBTREE,
        attributes=["cn", "uid", "givenName", "sn", "mail"]
    )

    if not conn.entries:
        return None

    user_entry = conn.entries[0]

    # Get user groups
    conn.search(
        search_base=f"ou=groups,{LDAP_BASE_DN}",
        search_filter=f"(member={user_dn})",
        search_scope=SUBTREE,
        attributes=["cn"]
    )

    groups = [entry.cn.value for entry in conn.entries]

    return {
        "username": user_entry.uid.value,
        "name": user_entry.cn.value,
        "first_name": user_entry.givenName.value if hasattr(user_entry, 'givenName') else "",
        "last_name": user_entry.sn.value if hasattr(user_entry, 'sn') else "",
        "email": user_entry.mail.value if hasattr(user_entry, 'mail') else "",
        "groups": groups,
        "is_admin": "admin" in groups or "rootadmin" in groups
    }
