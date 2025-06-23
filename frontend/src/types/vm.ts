export interface VM {
  id: string;
  name: string;
  status: VMStatus;
  cpu: number;
  memory: number; // in MB
  disk: number; // in GB
  os: string;
  ip_address?: string;
  node: string;
  created_at: string;
  owner_id: number;
}

export enum VMStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  SUSPENDED = 'suspended',
  FAILED = 'failed',
  CREATING = 'creating'
}

export interface VMMetrics {
  cpu_usage: number; // percentage
  memory_usage: number; // percentage
  disk_usage: number; // percentage
  network_in: number; // bytes
  network_out: number; // bytes
  uptime: number; // seconds
}

export interface VMTemplate {
  id: string;
  name: string;
  description: string;
  cpu: number;
  memory: number;
  disk: number;
  os: string;
}

export interface CreateVMRequest {
  name: string;
  template_id: string;
  node?: string;
}

export interface VMOperation {
  operation: 'start' | 'stop' | 'restart' | 'suspend' | 'resume';
  vm_id: string;
}

export interface VMSnapshot {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  vm_id: string;
}
