import { Request, Response } from 'express';
import Cart from '../models/Cart.model';
import User from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * DEBUG ENDPOINT - Check all carts in database
 * This will help identify if users are sharing carts
 */
export const debugCarts = asyncHandler(
  async (_req: Request, res: Response) => {
    // Get all carts
    const carts = await Cart.find().populate('user', 'email role');

    // Get all users
    const users = await User.find().select('email role');

    const cartInfo = carts.map(cart => ({
      cartId: cart._id,
      userId: cart.user,
      userEmail: (cart.user as any).email,
      userRole: (cart.user as any).role,
      itemsCount: cart.items.length,
      items: cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalCarts: carts.length,
        totalUsers: users.length,
        carts: cartInfo,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          role: u.role,
        })),
      },
    });
  }
);
