import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  // Security Settings
  sessionTimeout: number;
  passwordExpiryDays: number;
  twoFactorRequired: boolean;

  // Notification Settings
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  customerSignups: boolean;
  marketingEmails: boolean;

  // Store Information
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;

  // Business Configuration
  currency: string;
  baseCurrency: string; // Currency prices are stored in (PKR)
  usdToPkrRate: number; // Exchange rate: 1 USD = X PKR
  timezone: string;
  language: string;

  // Payment Settings
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  codEnabled: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  taxRate: number;
  includeTaxInPrices: boolean;

  // Shipping Settings
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  standardDeliveryDays: string;
  expressDeliveryDays: string;
  expressShippingEnabled: boolean;
  internationalShippingEnabled: boolean;

  // Advanced Settings
  maintenanceMode: boolean;
  debugMode: boolean;
  apiRateLimit: number;
  cacheDuration: number;

  // Metadata
  updatedBy: mongoose.Types.ObjectId;
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    // Security Settings
    sessionTimeout: {
      type: Number,
      default: 30,
    },
    passwordExpiryDays: {
      type: Number,
      default: 90,
    },
    twoFactorRequired: {
      type: Boolean,
      default: false,
    },

    // Notification Settings
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    orderNotifications: {
      type: Boolean,
      default: true,
    },
    lowStockAlerts: {
      type: Boolean,
      default: true,
    },
    customerSignups: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: true,
    },

    // Store Information
    storeName: {
      type: String,
      default: 'LuxeStore',
      required: true,
    },
    storeEmail: {
      type: String,
      default: 'admin@luxestore.com',
      required: true,
    },
    storePhone: {
      type: String,
      default: '+92-308-9389774',
    },
    storeAddress: {
      type: String,
      default: 'Ghanta Ghur Faisalabad',
    },

    // Business Configuration
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'PKR'],
    },
    baseCurrency: {
      type: String,
      default: 'PKR',
      enum: ['PKR'],
      required: true,
    },
    usdToPkrRate: {
      type: Number,
      default: 279.89,
      min: 1,
      required: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Karachi',
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'ur'],
    },

    // Payment Settings
    stripeEnabled: {
      type: Boolean,
      default: true,
    },
    paypalEnabled: {
      type: Boolean,
      default: true,
    },
    codEnabled: {
      type: Boolean,
      default: false,
    },
    stripePublishableKey: {
      type: String,
      default: '',
    },
    stripeSecretKey: {
      type: String,
      default: '',
      select: false, // Don't return by default for security
    },
    paypalClientId: {
      type: String,
      default: '',
    },
    taxRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    includeTaxInPrices: {
      type: Boolean,
      default: false,
    },

    // Shipping Settings
    freeShippingThreshold: {
      type: Number,
      default: 50,
    },
    standardShippingCost: {
      type: Number,
      default: 5.99,
    },
    expressShippingCost: {
      type: Number,
      default: 12.99,
    },
    standardDeliveryDays: {
      type: String,
      default: '5-7',
    },
    expressDeliveryDays: {
      type: String,
      default: '2-3',
    },
    expressShippingEnabled: {
      type: Boolean,
      default: true,
    },
    internationalShippingEnabled: {
      type: Boolean,
      default: false,
    },

    // Advanced Settings
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    debugMode: {
      type: Boolean,
      default: false,
    },
    apiRateLimit: {
      type: Number,
      default: 100,
      min: 10,
      max: 1000,
    },
    cacheDuration: {
      type: Number,
      default: 3600,
      min: 0,
    },

    // Metadata
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);

export default SystemSettings;
