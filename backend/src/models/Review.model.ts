import { Schema, model, Document } from 'mongoose';

export interface IReview extends Document {
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'Cannot upload more than 5 images',
      },
    },
    helpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
      comment: 'Verified purchase',
    },
    isApproved: {
      type: Boolean,
      default: true,
      comment: 'Admin approval status',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for querying approved reviews
reviewSchema.index({ product: 1, isApproved: 1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId: any) {
  const mongoose = require('mongoose');
  const objectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const stats = await this.aggregate([
    {
      $match: { product: objectId, isApproved: true },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await model('Product').findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews,
    });
  } else {
    await model('Product').findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

// Update product rating after save
reviewSchema.post('save', async function () {
  await (this.constructor as any).calcAverageRating(this.product);
});

// Update product rating after deleteOne
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await (this.constructor as any).calcAverageRating(this.product);
});

// Update product rating after update
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await (doc.constructor as any).calcAverageRating(doc.product);
  }
});

// Update product rating after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await (doc.constructor as any).calcAverageRating(doc.product);
  }
});

const Review = model<IReview>('Review', reviewSchema);

export default Review;
