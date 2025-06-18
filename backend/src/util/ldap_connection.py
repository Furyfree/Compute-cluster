from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import LDAPBindError
from contextlib import contextmanager
from src.util.env import get_required_env
from dotenv import load_dotenv

load_dotenv()

LDAP_HOST = get_required_env("LDAP_HOST")
LDAP_ADMIN_DN = get_required_env("LDAP_ADMIN_DN")
LDAP_ADMIN_PASSWORD = get_required_env("LDAP_ADMIN_PASSWORD")

server = Server(LDAP_HOST, get_info=ALL)

@contextmanager
def get_admin_connection():
    """Context manager for LDAP admin connections"""
    conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
    try:
        yield conn
    finally:
        if conn.bound:
            conn.unbind()

@contextmanager
def get_user_connection(user_dn: str, password: str):
    """Context manager for user authentication connections"""
    conn = None
    try:
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        yield conn
    except LDAPBindError:
        raise
    finally:
        if conn and conn.bound:
            conn.unbind()
