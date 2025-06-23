export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  group: string;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  group: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}
