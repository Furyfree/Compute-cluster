import { User, TokenResponse } from './user';
import { VM, VMMetrics, VMTemplate, VMOperation, VMSnapshot } from './vm';

// Base API response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Auth API
export interface AuthEndpoints {
  login: (credentials: { email: string; password: string }) => Promise<ApiResponse<TokenResponse>>;
  register: (userData: { name: string; email: string; password: string }) => Promise<ApiResponse<User>>;
  me: () => Promise<ApiResponse<User>>;
  logout: () => Promise<ApiResponse<void>>;
}

// User API
export interface UserEndpoints {
  getUser: (id: number) => Promise<ApiResponse<User>>;
  updateUser: (id: number, userData: Partial<User>) => Promise<ApiResponse<User>>;
  deleteUser: (id: number) => Promise<ApiResponse<void>>;
}

// Admin API
export interface AdminEndpoints {
  getUsers: () => Promise<ApiResponse<User[]>>;
  createUser: (userData: { name: string; email: string; password: string; is_admin?: boolean }) => Promise<ApiResponse<User>>;
  updateUser: (id: number, userData: Partial<User>) => Promise<ApiResponse<User>>;
  deleteUser: (id: number) => Promise<ApiResponse<void>>;
  getSystemStats: () => Promise<ApiResponse<SystemStats>>;
}

// VM API
export interface VMEndpoints {
  getVMs: () => Promise<ApiResponse<VM[]>>;
  getVM: (id: string) => Promise<ApiResponse<VM>>;
  createVM: (data: { name: string; template_id: string; node?: string }) => Promise<ApiResponse<VM>>;
  deleteVM: (id: string) => Promise<ApiResponse<void>>;
  getVMMetrics: (id: string) => Promise<ApiResponse<VMMetrics>>;
  performVMOperation: (operation: VMOperation) => Promise<ApiResponse<void>>;
  getVMSnapshots: (vmId: string) => Promise<ApiResponse<VMSnapshot[]>>;
  createVMSnapshot: (vmId: string, data: { name: string; description?: string }) => Promise<ApiResponse<VMSnapshot>>;
  restoreVMSnapshot: (vmId: string, snapshotId: string) => Promise<ApiResponse<void>>;
  deleteVMSnapshot: (vmId: string, snapshotId: string) => Promise<ApiResponse<void>>;
}

// Templates API
export interface TemplateEndpoints {
  getTemplates: () => Promise<ApiResponse<VMTemplate[]>>;
  getTemplate: (id: string) => Promise<ApiResponse<VMTemplate>>;
}

// System stats for admin dashboard
export interface SystemStats {
  total_vms: number;
  running_vms: number;
  total_users: number;
  active_users: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  nodes: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  }[];
}

// API Client type
export interface ApiClient {
  auth: AuthEndpoints;
  users: UserEndpoints;
  admin: AdminEndpoints;
  vms: VMEndpoints;
  templates: TemplateEndpoints;
  setToken: (token: string | null) => void;
  getToken: () => string | null;
}
