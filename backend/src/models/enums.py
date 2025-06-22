from enum import Enum

class SupportedOS(str, Enum):
    ubuntu = "UbuntuServer"
    debian = "Debian"
    centos = "CentOS"

OS_TEMPLATE_MAP = {
    SupportedOS.ubuntu: 202,
    SupportedOS.debian: 203,
    SupportedOS.centos: 204,
}
