export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  group?: string;
  is_admin?: boolean;
  created_at?: string;
  last_login?: string;
  dn?: string;
}

export interface UserInfo {
  success: boolean;
  user: User;
}

export interface UserListResponse {
  success?: boolean;
  users?: User[];
  data?: User[];
}

export interface CurrentUserResponse {
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  group?: string;
  is_admin: boolean;
  auth_type: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface ChangeUsernameData {
  new_username: string;
}

export type UserRole = "admin" | "user" | "test";
