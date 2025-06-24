// VM Types
export interface VM {
  vmid: number;
  name: string;
  node: string;
  status: "running" | "stopped" | "paused";
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  pid?: number;
  uptime?: number;
  template?: boolean;
  tags?: string;
  lock?: string;
}

export interface VMList {
  data: VM[];
}

export interface VMIPResponse {
  ip?: string;
  interfaces?: Array<{
    name: string;
    ip_addresses: string[];
    mac_address: string;
  }>;
}

// Container Types
export interface Container {
  vmid: number;
  name: string;
  node: string;
  status: "running" | "stopped" | "paused";
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  pid?: number;
  uptime?: number;
  template?: boolean;
  tags?: string;
  lock?: string;
  type: "lxc";
}

export interface ContainerList {
  data: Container[];
}

export interface ContainerIPResponse {
  ip?: string;
  interfaces?: Array<{
    name: string;
    ip_addresses: string[];
    mac_address: string;
  }>;
}

// Node Types
export interface NodeReport {
  node: string;
  uptime: number;
  loadavg: number[];
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  swap: {
    total: number;
    used: number;
    free: number;
  };
  rootfs: {
    total: number;
    used: number;
    avail: number;
  };
  ksm: {
    shared: number;
  };
}

export interface NodePerformance {
  cpu: number;
  loadavg: number[];
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
}

export interface NodePerformanceFull {
  cpu: number;
  loadavg: number[];
  memory: {
    total: number;
    used: number;
    free: number;
    buffers: number;
    cached: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    read_ios: number;
    write_ios: number;
  };
  network: {
    netin: number;
    netout: number;
  };
}

export interface DiskHealth {
  device: string;
  health: "PASSED" | "FAILED" | "UNKNOWN";
  temperature?: number;
  power_on_hours?: number;
  power_cycle_count?: number;
  reallocated_sector_count?: number;
  current_pending_sector?: number;
  offline_uncorrectable?: number;
}

// Provisioning Types
export interface ProvisionVMRequest {
  user: string;
  password: string;
  os: string;
}

export interface ProvisionVMResponse {
  success: boolean;
  vmid: number;
  node: string;
  message: string;
}

// Authentication Types
export interface ProxmoxUser {
  userid: string;
  comment?: string;
  email?: string;
  enable: boolean;
  expire?: number;
  firstname?: string;
  groups?: string[];
  keys?: string;
  lastname?: string;
  tokens?: any;
}

export interface ProxmoxGroup {
  groupid: string;
  comment?: string;
  members?: string[];
}

export interface AuthRealm {
  realm: string;
  type: string;
  comment?: string;
  default?: boolean;
}

// Operation Response Types
export interface ProxmoxOperationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface LoadBalanceResponse {
  success: boolean;
  message: string;
  migrations: Array<{
    vmid: number;
    from_node: string;
    to_node: string;
    reason: string;
  }>;
}

// Common Types
export type ProxmoxStatus = "running" | "stopped" | "paused";

export interface ProxmoxResource {
  vmid: number;
  name: string;
  node: string;
  status: ProxmoxStatus;
  type: "vm" | "lxc";
}
