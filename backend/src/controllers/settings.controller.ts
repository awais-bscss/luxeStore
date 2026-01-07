import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import SystemSettings from '../models/SystemSettings.model';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import mongoose from 'mongoose';

export const getSettings = asyncHandler(
  async (_req: AuthRequest, res: Response): Promise<void> => {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await SystemSettings.create({
        // Security Settings
        sessionTimeout: 30,
        passwordExpiryDays: 90,
        twoFactorRequired: false,

        // Notification Settings
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        customerSignups: false,
        marketingEmails: true,

        // Store Information
        storeName: 'LuxeStore',
        storeEmail: 'admin@luxestore.com',
        storePhone: '+92-308-9389774',
        storeAddress: 'Ghanta Ghur Faisalabad',

        // Business Configuration
        currency: 'USD',
        baseCurrency: 'PKR',
        usdToPkrRate: 279.89,
        timezone: 'Asia/Karachi',
        language: 'en',

        // Payment Settings
        stripeEnabled: true,
        paypalEnabled: true,
        codEnabled: false,
        taxRate: 10,
        includeTaxInPrices: false,

        // Shipping Settings
        freeShippingThreshold: 50,
        standardShippingCost: 5.99,
        expressShippingCost: 12.99,
        standardDeliveryDays: '5-7',
        expressDeliveryDays: '2-3',
        expressShippingEnabled: true,
        internationalShippingEnabled: false,

        // Advanced Settings
        maintenanceMode: false,
        debugMode: false,
        apiRateLimit: 100,
        cacheDuration: 3600,
      });
    }

    res.status(200).json({
      success: true,
      data: { settings },
    });
  }
);

export const updateSettings = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    if (req.user.role !== 'superadmin') {
      throw new UnauthorizedError('Only superadmin can update settings');
    }

    const updateData = req.body;

    // Validate required fields
    if (updateData.storeName && updateData.storeName.trim() === '') {
      throw new ValidationError('Store name cannot be empty');
    }

    if (updateData.storeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.storeEmail)) {
      throw new ValidationError('Invalid store email format');
    }

    // Validate numeric ranges
    if (updateData.taxRate !== undefined && (updateData.taxRate < 0 || updateData.taxRate > 100)) {
      throw new ValidationError('Tax rate must be between 0 and 100');
    }

    if (updateData.apiRateLimit !== undefined && (updateData.apiRateLimit < 10 || updateData.apiRateLimit > 1000)) {
      throw new ValidationError('API rate limit must be between 10 and 1000');
    }

    let settings = await SystemSettings.findOne();

    if (!settings) {
      // Create new settings with provided data
      settings = await SystemSettings.create({
        ...updateData,
        updatedBy: new mongoose.Types.ObjectId(req.user._id),
      });
    } else {
      // Update existing settings
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && key !== 'updatedBy') {
          (settings as any)[key] = updateData[key];
        }
      });

      settings.updatedBy = new mongoose.Types.ObjectId(req.user._id);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings },
    });
  }
);

export const clearCache = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized');
    }

    if (req.user.role !== 'superadmin') {
      throw new UnauthorizedError('Only superadmin can clear cache');
    }

    try {
      // Clear rate limiter cache
      const { cleanupRateLimitStore } = require('../middleware/rateLimit');
      cleanupRateLimitStore();

      // TODO: Add more cache clearing logic here as needed:
      // - Clear Redis cache if implemented
      // - Clear file-based cache if implemented
      // - Clear any other caching layers

      console.log('Cache cleared by:', req.user.email);

      res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
        clearedItems: [
          'Rate limiter cache',
          // Add more items as you implement them
        ],
      });
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error.message,
      });
    }
  }
);

