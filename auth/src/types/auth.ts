export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  isBoutique?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'creator' | 'admin';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
