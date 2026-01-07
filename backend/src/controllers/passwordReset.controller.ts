import { Request, Response } from 'express';
import passwordResetService from '../services/passwordReset.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (Step 1)
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const result = await passwordResetService.requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token (Step 3)
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password',
      });
    }

    const result = await passwordResetService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
export const verifyResetToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a token',
      });
    }

    const result = await passwordResetService.verifyResetToken(token);

    return res.status(200).json({
      success: true,
      data: result,
    });
  }
);
