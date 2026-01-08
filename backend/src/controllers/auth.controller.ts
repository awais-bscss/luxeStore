import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { ValidationError } from '../utils/errors';
import { AuthRequest } from '../types/auth.types';
import config from '../config';
import User from '../models/User.model';
import { sendEmail } from '../utils/email';

/**
 * Auth Controller - Handle HTTP requests for authentication
 */
class AuthController {
  /**
   * @route   POST /api/auth/signup
   * @desc    Register a new user
   * @access  Public
   */
  signup = asyncHandler(async (req: Request, res: Response) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { name, email, password, role } = req.body;

    const result = await authService.signup({ name, email, password, role });

    // Send verification email
    try {
      const user = await User.findById(result.user.id);
      if (user && !user.isEmailVerified) {
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user.emailVerificationToken = crypto
          .createHash('sha256')
          .update(verificationToken)
          .digest('hex');

        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Send email
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

        await sendEmail({
          to: user.email,
          subject: 'Verify Your Email - LuxeStore',
          html: `
            <h1>Welcome to LuxeStore!</h1>
            <p>Hello ${user.name},</p>
            <p>Thank you for registering! Please verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
            <p>Or copy this link: ${verificationUrl}</p>
            <p>This link expires in 24 hours.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Set cookie
    this.sendTokenResponse(res, result.token);

    return ApiResponse.authSuccess(
      res,
      201,
      result.token,
      result.user,
      'User registered successfully'
    );
  });

  /**
   * @route   POST /api/auth/login
   * @desc    Login user
   * @access  Public
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { email, password, deviceFingerprint } = req.body;

    const result = await authService.login({ email, password }, deviceFingerprint);

    // Check if 2FA is required
    if (result.requires2FA) {
      // User has 2FA enabled and device is not trusted - don't log them in yet
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        userId: result.user.id,
        message: 'Please enter your two-factor authentication code',
      });
    }

    // No 2FA required or device is trusted - proceed with normal login
    // Set cookie
    this.sendTokenResponse(res, result.token);

    return res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
      passwordExpired: result.passwordExpired,
      message: 'Login successful',
    });
  });

  /**
   * @route   GET /api/auth/profile
   * @desc    Get current user profile
   * @access  Private
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not found');
    }

    const profile = await authService.getProfile(req.user._id);

    return ApiResponse.success(res, 200, { user: profile });
  });

  /**
   * @route   POST /api/auth/logout
   * @desc    Logout user / clear cookie
   * @access  Private
   */
  logout = asyncHandler(async (_: Request, res: Response) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: config.env === 'production' ? 'none' : 'lax',
    });

    return ApiResponse.success(res, 200, null, 'Logout successful');
  });

  /**
   * Helper method to send token in cookie
   */
  private sendTokenResponse(res: Response, token: string) {
    const options = {
      expires: new Date(
        Date.now() + config.jwt.cookieExpire * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: config.env === 'production', // Use secure cookies in production
      sameSite: config.env === 'production' ? 'none' as const : 'lax' as const,
    };

    res.cookie('token', token, options);
  }
}

export default new AuthController();
