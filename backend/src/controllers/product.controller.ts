import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import productService from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.createProduct({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  }
);

export const getAllProducts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = { ...req.query };

    if (filters.createdBy === 'me' && req.user) {
      filters.createdBy = req.user._id;
    }

    const result = await productService.getAllProducts(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getProductById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.getProductById(req.params.id, true);

    res.status(200).json({
      success: true,
      data: { product },
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }
);

export const updateStock = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { quantity } = req.body;
    const product = await productService.updateStock(req.params.id, quantity);

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: { product },
    });
  }
);
