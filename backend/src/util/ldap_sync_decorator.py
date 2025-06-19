from functools import wraps
from src.services.proxmox_service import sync_ldap_changes
import logging

def sync_ldap_after(func):
    """Decorator to sync LDAP changes to Proxmox after LDAP operations"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)

        # Only sync if the LDAP operation was successful
        if result and (not isinstance(result, dict) or result.get('success', True)):
            try:
                sync_ldap_changes()
                logging.info(f"LDAP sync completed after {func.__name__}")
            except Exception as e:
                logging.error(f"LDAP sync failed after {func.__name__}: {e}")

        return result
    return wrapper
