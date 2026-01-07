import crypto from 'crypto';
import User from '../models/User.model';
import { ValidationError } from '../utils/errors';
import { sendEmail } from '../utils/email';


class PasswordResetService {
  /**
   * Step 1: Generate reset token and send email
   * - Generates a random token
   * - Hashes it and saves to database
   * - Sets expiration time (10 minutes)
   */
  async requestPasswordReset(email: string) {
    // Find user by exact email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return {
        message: 'If that email exists, a password reset link has been sent.',
      };
    }

    // Progressive cooldown: 1st = 60s, 2nd = 5min, 3rd+ = 30min
    if (user.lastPasswordResetRequest) {
      const timeSinceLastRequest = Date.now() - new Date(user.lastPasswordResetRequest).getTime();
      const oneHour = 60 * 60 * 1000;

      // Reset attempts if more than 1 hour has passed
      if (timeSinceLastRequest > oneHour) {
        user.passwordResetAttempts = 0;
      } else {
        // Determine cooldown based on attempts
        let cooldownPeriod: number;

        if (user.passwordResetAttempts === 0) {
          cooldownPeriod = 60 * 1000; // 60 seconds
        } else if (user.passwordResetAttempts === 1) {
          cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        } else {
          cooldownPeriod = 30 * 60 * 1000; // 30 minutes
        }

        if (timeSinceLastRequest < cooldownPeriod) {
          const remainingMs = cooldownPeriod - timeSinceLastRequest;
          const remainingMinutes = Math.floor(remainingMs / 60000);
          const remainingSeconds = Math.ceil((remainingMs % 60000) / 1000);

          let timeMessage = '';
          if (remainingMinutes > 0) {
            timeMessage = `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
            if (remainingSeconds > 0) {
              timeMessage += ` and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
            }
          } else {
            timeMessage = `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
          }

          throw new ValidationError(
            `Too many password reset requests. Please wait ${timeMessage} before trying again.`
          );
        }
      }
    }

    // Increment attempts and save timestamp
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    user.lastPasswordResetRequest = new Date();

    // Generate random token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiration to database (attempts already incremented above)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - LuxeStore',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br>LuxeStore Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Clear the reset token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.lastPasswordResetRequest = null;
      user.passwordResetAttempts = Math.max(0, (user.passwordResetAttempts || 1) - 1); // Revert attempt increment
      await user.save();
      throw new Error('Failed to send password reset email. Please try again later.');
    }

    // Return the UNHASHED token to send in email
    // (We never save the unhashed token in database)
    return {
      resetToken, // This goes in the email link
      email: user.email,
      name: user.name,
      message: 'If that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Step 2: Verify token and reset password
   * - Hashes the token from URL
   * - Checks if it matches database
   * - Verifies expiration
   * - Updates password
   * - Destroys token
   */
  async resetPassword(token: string, newPassword: string) {

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token that hasn't expired
    // IMPORTANT: Select password field explicitly (it's excluded by default)
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    }).select('+password');

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Validate new password with strong requirements
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (!/[0-9]/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one number');
    }

    // SECURITY: Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new ValidationError('New password cannot be the same as your previous password. Please choose a different password.');
    }

    // Set the new password (will be hashed by User model's pre-save hook)
    user.password = newPassword;

    // Update passwordChangedAt timestamp
    user.passwordChangedAt = new Date();

    // DESTROY the token (prevent replay attacks)
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return {
      message: 'Password has been reset successfully',
    };
  }

  /**
   * Verify if a reset token is valid (without resetting password)
   * Useful for checking token before showing reset form
   */
  async verifyResetToken(token: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    return {
      valid: true,
      email: user.email,
    };
  }
}

export default new PasswordResetService();
