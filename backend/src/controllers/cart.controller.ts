import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import cartService from '../services/cart.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    console.log('=== GET CART REQUEST ===');
    console.log('User ID:', req.user!._id);
    console.log('User email:', req.user!.email);
    console.log('User role:', req.user!.role);

    const cart = await cartService.getCart(req.user!._id);

    console.log('Cart found for user:', cart.user);
    console.log('Cart items count:', cart.items.length);

    res.status(200).json({
      success: true,
      data: { cart },
    });
  }
);

export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!._id, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  }
);

export const updateCartItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user!._id, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { cart },
    });
  }
);

export const removeFromCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    console.log('=== REMOVE FROM CART REQUEST ===');
    console.log('User ID:', req.user!._id);
    console.log('User email:', req.user!.email);
    console.log('Product ID to remove:', productId);

    const cart = await cartService.removeFromCart(req.user!._id, productId);

    console.log('Cart after removal - items count:', cart.items.length);
    console.log('Remaining items:', cart.items.map(item => item.product));

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart },
    });
  }
);

export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const cart = await cartService.clearCart(req.user!._id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  }
);

export const mergeCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { items } = req.body;
    const cart = await cartService.mergeCart(req.user!._id, items);

    res.status(200).json({
      success: true,
      message: 'Cart merged successfully',
      data: { cart },
    });
  }
);
