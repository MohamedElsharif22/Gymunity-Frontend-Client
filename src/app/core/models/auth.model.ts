/**
 * User authentication and profile models
 * Aligns with Gymunity Backend API specification
 */

export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
  role: UserRole;
  profilePhotoUrl?: string;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole; // assign to client by default 1 = Client
  profilePhoto?: File;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  userName: string;
  email: string;
  role: UserRole;
  profilePhotoUrl?: string;
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  userName?: string;
  email?: string;
  profilePhoto?: File;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SendResetPasswordLinkRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export enum UserRole {
  Client = 1,
  Trainer = 2
}
