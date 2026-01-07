"use client";

import React, { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { MessageSquare, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useToast } from '../../hooks/useToast';
import CustomDropdown from '../ui/CustomDropdown';

interface ReviewListProps {
  productId: string;
  onReviewChange?: () => void; // Callback when reviews are added/updated/deleted
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ReviewList: React.FC<ReviewListProps> = ({ productId, onReviewChange }) => {
  const toast = useToast();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    rating: '',
    sort: '-createdAt',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, pagination.page, filters]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
      });

      if (filters.rating) {
        params.append('rating', filters.rating);
      }

      const response = await fetch(
        `${API_URL}/reviews/product/${productId}?${params}`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setPagination({
          ...pagination,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages,
        });
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Error', 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error('Login Required', 'Please login to write a review');
      return;
    }
    setShowForm(true);
    setEditingReview(null);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
    // Notify parent to refresh stats
    if (onReviewChange) {
      onReviewChange();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter((r) => r._id !== reviewId));
    setPagination({ ...pagination, total: pagination.total - 1 });
    // Notify parent to refresh stats
    if (onReviewChange) {
      onReviewChange();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Reviews ({pagination.total})
        </h2>
        {!showForm && (
          <button
            onClick={handleWriteReview}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingReview ? 'Edit Your Review' : 'Write Your Review'}
          </h3>
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </span>
        </div>

        {/* Rating Filter */}
        <CustomDropdown
          value={filters.rating}
          onChange={(value) => {
            setFilters({ ...filters, rating: value });
            setPagination({ ...pagination, page: 1 });
          }}
          options={[
            { value: '', label: 'All Ratings' },
            { value: '5', label: '5 Stars' },
            { value: '4', label: '4 Stars' },
            { value: '3', label: '3 Stars' },
            { value: '2', label: '2 Stars' },
            { value: '1', label: '1 Star' },
          ]}
          className="min-w-[140px]"
        />

        {/* Sort */}
        <CustomDropdown
          value={filters.sort}
          onChange={(value) => {
            setFilters({ ...filters, sort: value });
            setPagination({ ...pagination, page: 1 });
          }}
          options={[
            { value: '-createdAt', label: 'Most Recent' },
            { value: 'createdAt', label: 'Oldest First' },
            { value: '-rating', label: 'Highest Rated' },
            { value: 'rating', label: 'Lowest Rated' },
            { value: '-helpful', label: 'Most Helpful' },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Be the first to review this product!
          </p>
          {isAuthenticated && (
            <button
              onClick={handleWriteReview}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && reviews.length > 0 && pagination.pages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page <span className="font-semibold text-gray-900 dark:text-white">{pagination.page}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{pagination.pages}</span>
              {' '}({pagination.total} total reviews)
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.page === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30'
                  }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${pagination.page === pageNum
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.page === pagination.pages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
