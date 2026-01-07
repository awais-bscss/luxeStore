import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import reviewService from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';

class ReviewController {
  // @desc    Create a new review
  // @route   POST /api/reviews
  // @access  Private (Customer)
  createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const review = await reviewService.createReview(req.user!._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  });

  // @desc    Get all reviews for a product
  // @route   GET /api/reviews/product/:productId
  // @access  Public
  getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const result = await reviewService.getProductReviews(productId, req.query);

    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: result,
    });
  });

  // @desc    Get review by ID
  // @route   GET /api/reviews/:id
  // @access  Public
  getReviewById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const review = await reviewService.getReviewById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review fetched successfully',
      data: { review },
    });
  });

  // @desc    Update review
  // @route   PUT /api/reviews/:id
  // @access  Private (Owner)
  updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user!._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review },
    });
  });

  // @desc    Delete review
  // @route   DELETE /api/reviews/:id
  // @access  Private (Owner/Admin)
  deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await reviewService.deleteReview(
      req.params.id,
      req.user!._id,
      req.user!.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: null,
    });
  });

  // @desc    Get user's reviews
  // @route   GET /api/reviews/user/me
  // @access  Private
  getUserReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await reviewService.getUserReviews(req.user!._id, req.query);

    res.status(200).json({
      success: true,
      message: 'User reviews fetched successfully',
      data: result,
    });
  });

  // @desc    Mark review as helpful
  // @route   POST /api/reviews/:id/helpful
  // @access  Public
  markHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
    const review = await reviewService.markHelpful(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: { review },
    });
  });

  // @desc    Update review approval status
  // @route   PATCH /api/reviews/:id/status
  // @access  Private (Admin)
  updateReviewStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { isApproved } = req.body;
    const review = await reviewService.updateReviewStatus(req.params.id, isApproved);

    res.status(200).json({
      success: true,
      message: 'Review status updated successfully',
      data: { review },
    });
  });

  // @desc    Get review statistics for a product
  // @route   GET /api/reviews/product/:productId/stats
  // @access  Public
  getReviewStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await reviewService.getReviewStats(req.params.productId);

    res.status(200).json({
      success: true,
      message: 'Review statistics fetched successfully',
      data: { stats },
    });
  });

  // @desc    Get all reviews (Admin)
  // @route   GET /api/reviews
  // @access  Private (Admin)
  getAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await reviewService.getAllReviews(req.query);

    res.status(200).json({
      success: true,
      message: 'All reviews fetched successfully',
      data: result,
    });
  });
}

export default new ReviewController();
