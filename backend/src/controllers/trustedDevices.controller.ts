import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { ValidationError, UnauthorizedError } from '../utils/errors';

/**
 * @route   GET /api/auth/trusted-devices
 * @desc    Get list of trusted devices
 * @access  Private
 */
export const getTrustedDevices = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Filter out expired devices
    const activeDevices = user.trustedDevices.filter(
      (device) => new Date(device.expiresAt) > new Date()
    );

    res.status(200).json({
      success: true,
      data: { devices: activeDevices },
    });
  }
);

/**
 * @route   DELETE /api/auth/trusted-devices/:fingerprint
 * @desc    Remove a trusted device
 * @access  Private
 */
export const removeTrustedDevice = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    const { fingerprint } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ValidationError('User not found');
    }

    user.trustedDevices = user.trustedDevices.filter(
      (device) => device.fingerprint !== fingerprint
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Device removed successfully',
    });
  }
);

/**
 * @route   DELETE /api/auth/trusted-devices
 * @desc    Remove all trusted devices
 * @access  Private
 */
export const removeAllTrustedDevices = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ValidationError('User not found');
    }

    user.trustedDevices = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'All trusted devices removed successfully',
    });
  }
);
