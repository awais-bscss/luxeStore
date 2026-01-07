import { Request } from 'express';
import { UserRole } from '../constants';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  profileImage?: string;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  phone?: string;
  location?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: Date;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  lastPasswordResetRequest?: Date | null;
  passwordResetAttempts: number;
  twoFactorSecret?: string | null;
  twoFactorEnabled: boolean;
  backupCodes: string[];
  trustedDevices: Array<{
    fingerprint: string;
    name: string;
    ipAddress?: string;
    userAgent?: string;
    addedAt: Date;
    expiresAt: Date;
  }>;
  passwordChangedAt: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage?: string;
  };
}
