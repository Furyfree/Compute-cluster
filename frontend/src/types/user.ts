export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
}
