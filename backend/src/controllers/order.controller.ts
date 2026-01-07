import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import orderService from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;

    // Check if customer is blocked
    const customer = await User.findById(userId);
    if (!customer) {
      throw new NotFoundError('User not found');
    }

    if (customer.status === 'blocked') {
      throw new UnauthorizedError('Your account has been suspended. Please contact support.');
    }

    // Check email verification for second+ orders
    if (!customer.isEmailVerified && customer.totalOrders >= 1) {
      throw new UnauthorizedError(
        'Please verify your email to place additional orders. Check your inbox for the verification link.'
      );
    }

    const order = await orderService.createOrder(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
      emailVerificationRequired: !customer.isEmailVerified, // Flag for frontend
    });
  }
);

export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, paymentStatus, startDate, endDate, page = '1', limit = '20' } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await orderService.getAllOrders(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getUserOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orders = await orderService.getUserOrders(req.user!._id);

    res.status(200).json({
      success: true,
      data: { orders, count: orders.length },
    });
  }
);

export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);

    res.status(200).json({
      success: true,
      data: { order },
    });
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: { order },
    });
  }
);

export const updatePaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const order = await orderService.updatePaymentStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: { order },
    });
  }
);

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.cancelOrder(req.params.id, req.user!._id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      data: { order },
    });
  }
);

export const getOrderStats = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const stats = await orderService.getOrderStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

export const archiveOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.archiveOrder(req.params.id, req.user!._id);

    res.status(200).json({
      success: true,
      message: 'Order archived successfully',
      data: { order },
    });
  }
);

export const unarchiveOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.unarchiveOrder(req.params.id, req.user!._id);

    res.status(200).json({
      success: true,
      message: 'Order unarchived successfully',
      data: { order },
    });
  }
);
