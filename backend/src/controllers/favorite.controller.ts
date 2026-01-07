import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import favoriteService from '../services/favorite.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getFavorites = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const favorites = await favoriteService.getFavorites(req.user!._id);

    res.status(200).json({
      success: true,
      data: { favorites },
    });
  }
);

export const addToFavorites = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;
    const favorites = await favoriteService.addToFavorites(req.user!._id, productId);

    res.status(200).json({
      success: true,
      message: 'Added to favorites',
      data: { favorites },
    });
  }
);

export const removeFromFavorites = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const favorites = await favoriteService.removeFromFavorites(req.user!._id, productId);

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
      data: { favorites },
    });
  }
);

export const mergeFavorites = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productIds } = req.body;
    const favorites = await favoriteService.mergeFavorites(req.user!._id, productIds);

    res.status(200).json({
      success: true,
      message: 'Favorites merged successfully',
      data: { favorites },
    });
  }
);

export const clearFavorites = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const favorites = await favoriteService.clearFavorites(req.user!._id);

    res.status(200).json({
      success: true,
      message: 'All favorites cleared',
      data: { favorites },
    });
  }
);

