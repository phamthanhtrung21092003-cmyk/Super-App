export interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthService {
  register(phone: string, password: string, fullName: string): Promise<void>;
  login(phone: string, password: string): Promise<LoginResponse>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>;
  logout(): Promise<void>;
}

export interface IAuthRepository {
  register(phone: string, password: string, fullName: string): Promise<{ success: boolean; message: string }>;
  login(phone: string, password: string): Promise<{ success: boolean; fullName?: string; message: string; user?: any }>;
  logout(): Promise<void>;
  restoreSession(): Promise<{ success: boolean; user?: any }>;
}
