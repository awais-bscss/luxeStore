import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  images: string[];
  thumbnail: string;
  tags: string[];
  specifications: {
    key: string;
    value: string;
  }[];
  isActive: boolean;
  isFeatured: boolean;
  discount?: number;
  rating: number;
  reviewCount: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    specifications: {
      type: [{
        key: { type: String, required: true },
        value: { type: String, required: true },
      }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
