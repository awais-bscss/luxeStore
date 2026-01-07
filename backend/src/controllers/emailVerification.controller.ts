import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { NotFoundError, ValidationError } from '../utils/errors';
import { sendEmail } from '../utils/email';

/**
 * Send verification email
 * @route POST /api/auth/send-verification
 * @access Private
 */
export const sendVerificationEmail = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user!._id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // ✅ ANTI-SPAM: Check if verification email was sent recently
    if (user.emailVerificationExpires) {
      const timeSinceLastEmail = Date.now() - (user.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000);
      const cooldownPeriod = 60 * 1000; // 60 seconds

      if (timeSinceLastEmail < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastEmail) / 1000);
        throw new ValidationError(
          `Please wait ${remainingSeconds} seconds before requesting another verification email`
        );
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to user
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Set expiration (24 hours)
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Email content
    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering with LuxeStore! Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>LuxeStore Team</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - LuxeStore',
        html: message,
      });

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error) {
      // Clear token if email fails
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      throw new Error('Email could not be sent. Please try again later.');
    }
  }
);

/**
 * Verify email with token
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Check if there's a user with this token but it's already verified
      const verifiedUser = await User.findOne({
        emailVerificationToken: hashedToken,
      });

      if (verifiedUser && verifiedUser.isEmailVerified) {
        res.status(200).json({
          success: true,
          message: 'Email is already verified! You can now place unlimited orders.',
        });
        return;
      }

      throw new ValidationError('Invalid or expired verification token');
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now place unlimited orders.',
    });
  }
);
