import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { ApiResponse } from '../utils/apiResponse';
import { ValidationError, UnauthorizedError } from '../utils/errors';

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, profileImage } = req.body;

    console.log('=== UPDATE PROFILE ===');
    console.log('Request body:', { name, profileImage });
    console.log('User ID:', req.user?._id);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    console.log('Profile updated:', {
      name: user.name,
      profileImage: user.profileImage,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
      },
    });
  }
);

/**
 * Change user password
 * @route PUT /api/users/change-password
 * @access Private (All authenticated users)
 */
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log('=== CHANGE PASSWORD ===');
    console.log('User ID:', req.user?._id);

    // Validate request
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError('Please provide all required fields');
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw new ValidationError('New passwords do not match');
    }

    // Get user with password field (it's excluded by default)
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // SECURITY: Validate new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new ValidationError('New password cannot be the same as your current password. Please choose a different password.');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully for user:', user.email);

    ApiResponse.success(
      res,
      200,
      null,
      'Password changed successfully'
    );
  }
);

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  }
);

/**
 * Get all customers (admin only)
 * @route GET /api/users/customers
 * @access Private/Admin
 */
export const getCustomers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    console.log('=== GET CUSTOMERS ===');
    console.log('User:', { id: req.user?._id, role: req.user?.role });
    const { page = 1, limit = 10, search, createdAt } = req.query;
    console.log('Query:', { page, limit, search });

    // Build query
    const query: any = { role: 'user' };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Add date filter for growth calculation
    if (createdAt) {
      const dateFilter: any = {};
      if (typeof createdAt === 'object') {
        if ((createdAt as any).gte) {
          dateFilter.$gte = new Date((createdAt as any).gte);
        }
        if ((createdAt as any).lt) {
          dateFilter.$lt = new Date((createdAt as any).lt);
        }
      }
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Fetch customers
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    // Format customers data to match frontend expectations
    const formattedCustomers = customers.map(customer => ({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      profileImage: customer.profileImage,
      isEmailVerified: customer.isEmailVerified,
      joinDate: customer.createdAt,
      status: customer.status || 'active',
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      lastOrder: customer.lastOrder || null,
      phone: customer.phone,
      location: customer.location,
    }));

    console.log('Sending response:', {
      success: true,
      customersCount: formattedCustomers.length,
      total,
    });

    res.status(200).json({
      success: true,
      data: {
        customers: formattedCustomers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  }
);
