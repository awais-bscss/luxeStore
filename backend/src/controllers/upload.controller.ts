import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import cloudinary from '../config/cloudinary.config';
import streamifier from 'streamifier';

/**
 * Upload a single image to Cloudinary
 */
export const uploadImage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    try {
      // Upload to Cloudinary using stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'luxestore/products',
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
      });

      const uploadResult = result as any;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message,
      });
    }
  }
);

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleImages = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    try {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'luxestore/products',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result: any) => ({
        url: result.secure_url,
        publicId: result.public_id,
      }));

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: uploadedImages,
        },
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message,
      });
    }
  }
);

/**
 * Delete an image from Cloudinary
 */
export const deleteImage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { publicId } = req.body;

    if (!publicId) {
      res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message,
      });
    }
  }
);

/**
 * Upload blog featured image to Cloudinary
 */
export const uploadBlogImage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    try {
      // Upload to Cloudinary using stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'luxestore/blogs',
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1200, height: 630, crop: 'fill' }, // Blog featured image size
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
      });

      const uploadResult = result as any;

      res.status(200).json({
        success: true,
        message: 'Blog image uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload blog image',
        error: error.message,
      });
    }
  }
);
