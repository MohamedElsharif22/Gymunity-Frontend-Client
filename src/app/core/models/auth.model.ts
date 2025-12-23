// User authentication and profile models
export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  profilePhoto?: string;
  role: UserRole;
  createdAt?: Date;
}

export interface LoginRequest {
  emailOrUserName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
  profilePhoto?: File;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  userName: string;
  email: string;
  fullName: string;
  profilePhoto?: File;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export enum UserRole {
  Client = 1,
  Trainer = 2
}
