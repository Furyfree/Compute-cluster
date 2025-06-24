from enum import Enum

class SupportedOS(str, Enum):
    ubuntu = "UbuntuServer"
    debian = "Debian"
    centos = "CentOS"

OS_TEMPLATE_MAP = {
    SupportedOS.ubuntu: 203,
    SupportedOS.debian: 204,
    SupportedOS.centos: 205,
}
