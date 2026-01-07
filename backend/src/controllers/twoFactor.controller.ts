import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import config from '../config';
import authService from '../services/auth.service';

export const enable2FA = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user) {
      throw new ValidationError('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `LuxeStore (${user.email})`,
      length: 32,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: secret.otpauth_url,
      },
    });
  }
);

export const verify2FA = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    if (!token) {
      throw new ValidationError('Verification code is required');
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret +backupCodes');
    if (!user || !user.twoFactorSecret) {
      throw new ValidationError('2FA not initialized');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      throw new ValidationError('Invalid verification code');
    }

    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push(code);
      const hashedCode = await bcrypt.hash(code, 10);
      user.backupCodes.push(hashedCode);
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        backupCodes,
      },
    });
  }
);

export const disable2FA = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { password } = req.body;

    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    if (!password) {
      throw new ValidationError('Password is required to disable 2FA');
    }

    const user = await User.findById(req.user._id).select('+password +twoFactorSecret +backupCodes');
    if (!user) {
      throw new ValidationError('User not found');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('Incorrect password');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  }
);

export const verify2FALogin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId, token, useBackupCode, trustDevice, deviceFingerprint, deviceName } = req.body;

    if (!userId || !token) {
      throw new ValidationError('User ID and token are required');
    }

    const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new ValidationError('2FA is not enabled for this user');
    }

    let verified = false;

    if (useBackupCode) {
      for (let i = 0; i < user.backupCodes.length; i++) {
        const isMatch = await bcrypt.compare(token, user.backupCodes[i]);
        if (isMatch) {
          verified = true;
          user.backupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    } else {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: token,
        window: 2,
      });
    }

    if (!verified) {
      throw new ValidationError('Invalid verification code');
    }

    // Add device to trusted list if requested
    if (trustDevice && deviceFingerprint) {
      // Remove expired devices
      user.trustedDevices = user.trustedDevices.filter(
        (device) => new Date(device.expiresAt) > new Date()
      );

      // Check if device already trusted
      const existingDevice = user.trustedDevices.find(
        (device) => device.fingerprint === deviceFingerprint
      );

      if (!existingDevice) {
        user.trustedDevices.push({
          fingerprint: deviceFingerprint,
          name: deviceName || 'Unknown Device',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          addedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        await user.save();
      }
    }

    // 2FA Verified - Generate token and set cookie
    const tokenResponse = user.generateAuthToken();

    // Set cookie options (same as in AuthController)
    const cookieOptions = {
      expires: new Date(
        Date.now() + config.jwt.cookieExpire * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('token', tokenResponse, cookieOptions);

    // Get full user profile for response
    const userProfile = await authService.getProfile(user._id.toString());

    res.status(200).json({
      success: true,
      message: '2FA verified successfully',
      token: tokenResponse,
      data: {
        user: {
          ...userProfile,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    });
  }
);
