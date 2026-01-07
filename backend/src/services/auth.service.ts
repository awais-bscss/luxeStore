import User from '../models/User.model';
import SystemSettings from '../models/SystemSettings.model';
import { ConflictError, UnauthorizedError, ValidationError, ForbiddenError } from '../utils/errors';
import { LoginCredentials, SignupCredentials } from '../types/auth.types';
import notificationService from './notification.service';

/**
 * Auth Service - Business logic for authentication
 */
class AuthService {
  /**
   * Register a new user
   */
  async signup(credentials: SignupCredentials) {
    const { name, email, password, role } = credentials;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const userRole = role || 'user';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      lastActivity: new Date(),
    });

    // Send notification to admins if it's a customer signup and notifications are enabled
    if (userRole === 'user') {
      try {
        const settings = await SystemSettings.findOne();
        if (settings?.customerSignups) {
          await notificationService.notifyNewCustomer(
            user._id.toString(),
            user.name,
            user.email
          );
        }
      } catch (error) {
        console.error('Failed to send signup notification:', error);
        // Don't throw error - signup should succeed even if notification fails
      }
    }

    // Generate token
    const token = user.generateAuthToken();

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials, deviceFingerprint?: string) {
    const { email, password } = credentials;

    // Check if user exists and get password & security fields
    const user = await User.findOne({ email }).select('+password +status +passwordChangedAt');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check for Password Expiry
    const settings = await SystemSettings.findOne();
    const passwordExpiryDays = settings?.passwordExpiryDays || 90;

    let passwordExpired = false;
    if (user.passwordChangedAt) {
      const lastChangedTime = new Date(user.passwordChangedAt).getTime();
      const currentTime = new Date().getTime();
      const diffInDays = (currentTime - lastChangedTime) / (1000 * 60 * 60 * 24);

      if (diffInDays > passwordExpiryDays) {
        passwordExpired = true;
      }
    }

    // Check if 2FA is enabled and device is not trusted
    let requires2FA = false;
    if (user.twoFactorEnabled && deviceFingerprint) {
      // Clean up expired devices
      user.trustedDevices = user.trustedDevices.filter(
        (device) => new Date(device.expiresAt) > new Date()
      );

      // Check if current device is trusted
      const isTrustedDevice = user.trustedDevices.some(
        (device) => device.fingerprint === deviceFingerprint
      );

      requires2FA = !isTrustedDevice;
      await user.save({ validateBeforeSave: false });
    } else if (user.twoFactorEnabled) {
      requires2FA = true;
    }

    // Update last activity on successful login
    user.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.generateAuthToken();

    return {
      token,
      passwordExpired,
      requires2FA,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
