import { Request, Response } from 'express';
import User from '../models/User.model';
import { USER_ROLES } from '../constants';

/**
 * @desc    Get all customers (users with role 'user')
 * @route   GET /api/customers
 * @access  Private/Admin
 */
export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    console.log('=== GET ALL CUSTOMERS ===');
    // Find all users with role 'user' (customers)
    const customers = await User.find({ role: USER_ROLES.USER })
      .select('-password')
      .sort({ createdAt: -1 });

    // Transform data to include additional fields
    const customersData = customers.map((customer) => ({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      profileImage: customer.profileImage,
      isEmailVerified: customer.isEmailVerified,
      joinDate: customer.createdAt,
      status: customer.status || 'active',
      phone: customer.phone,
      location: customer.location,
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      lastOrder: customer.lastOrder || null,
    }));

    console.log('Sending response (getAllCustomers):', {
      success: true,
      customersCount: customersData.length,
    });

    return res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: {
        customers: customersData,
        total: customersData.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
    });
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private/Admin
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: USER_ROLES.USER,
    }).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        profileImage: customer.profileImage,
        isEmailVerified: customer.isEmailVerified,
        joinDate: customer.createdAt,
        status: customer.status || 'active',
        phone: customer.phone,
        location: customer.location,
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0,
        lastOrder: customer.lastOrder || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message,
    });
  }
};

/**
 * @desc    Update customer status
 * @route   PUT /api/customers/:id
 * @access  Private/SuperAdmin
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, location, status, isEmailVerified } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: USER_ROLES.USER },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private/SuperAdmin
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOneAndDelete({
      _id: req.params.id,
      role: USER_ROLES.USER,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message,
    });
  }
};
