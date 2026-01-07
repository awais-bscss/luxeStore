import Review from '../models/Review.model';
import Product from '../models/Product.model';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';

class ReviewService {
  // Create a new review
  async createReview(userId: string, reviewData: any) {
    const { product, rating, title, comment, images } = reviewData;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      throw new NotFoundError('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, user: userId });
    if (existingReview) {
      throw new ValidationError('You have already reviewed this product');
    }

    // Create review
    const review = await Review.create({
      product,
      user: userId,
      rating,
      title,
      comment,
      images: images || [],
      verified: false, // Will be set to true if user purchased the product
    });

    // Populate user details
    await review.populate('user', 'name email');

    return review;
  }

  // Get all reviews for a product
  async getProductReviews(productId: string, filters: any = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      rating,
      verified,
    } = filters;

    const query: any = {
      product: productId,
      isApproved: true,
    };

    if (rating) {
      query.rating = Number(rating);
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Get review by ID
  async getReviewById(reviewId: string) {
    const review = await Review.findById(reviewId).populate('user', 'name email');

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    return review;
  }

  // Update review
  async updateReview(reviewId: string, userId: string, updateData: any) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      throw new UnauthorizedError('You can only update your own reviews');
    }

    // Update allowed fields
    const allowedFields = ['rating', 'title', 'comment', 'images'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        (review as any)[field] = updateData[field];
      }
    });

    await review.save();
    await review.populate('user', 'name email');

    return review;
  }

  // Delete review
  async deleteReview(reviewId: string, userId: string, userRole: string) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
      throw new UnauthorizedError('You can only delete your own reviews');
    }

    await review.deleteOne();

    return { message: 'Review deleted successfully' };
  }

  // Get user's reviews
  async getUserReviews(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name thumbnail price')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ user: userId }),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Mark review as helpful
  async markHelpful(reviewId: string) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    review.helpful += 1;
    await review.save();

    return review;
  }

  // Admin: Approve/Reject review
  async updateReviewStatus(reviewId: string, isApproved: boolean) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    review.isApproved = isApproved;
    await review.save();

    return review;
  }

  // Get review statistics for a product
  async getReviewStats(productId: any) {
    const mongoose = require('mongoose');
    const objectId = mongoose.Types.ObjectId.isValid(productId)
      ? new mongoose.Types.ObjectId(productId)
      : productId;

    const stats = await Review.aggregate([
      {
        $match: { product: objectId, isApproved: true },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const avgRating =
      stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / (total || 1);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat._id as keyof typeof ratingDistribution] = stat.count;
    });

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      distribution: ratingDistribution,
    };
  }

  // Get all reviews (Admin)
  async getAllReviews(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      rating,
      verified,
    } = filters;

    const query: any = {};

    if (rating) {
      query.rating = Number(rating);
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name thumbnail')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }
}

export default new ReviewService();
