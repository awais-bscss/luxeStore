"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Star,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import CustomDropdown from '@/components/ui/CustomDropdown';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    thumbnail: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, approved, hidden
    rating: '',
    verified: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.push('/');
      return;
    }
    if (token) {
      fetchReviews();
    }
  }, [isAuthenticated, user, token, pagination.page, filters]);

  // Debounced search effect
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const debounceTimer = setTimeout(() => {
      fetchReviews();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchReviews = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.rating) params.append('rating', filters.rating);
      if (filters.verified) params.append('verified', filters.verified);

      const response = await fetch(`${API_URL}/reviews?${params}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        let filteredReviews = data.data.reviews;

        // Filter by approval status
        if (filters.status === 'approved') {
          filteredReviews = filteredReviews.filter((r: Review) => r.isApproved);
        } else if (filters.status === 'hidden') {
          filteredReviews = filteredReviews.filter((r: Review) => !r.isApproved);
        }

        // Filter by search term
        if (searchTerm) {
          filteredReviews = filteredReviews.filter((r: Review) =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.product.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setReviews(filteredReviews);
        setPagination({
          ...pagination,
          total: data.data.pagination?.total || filteredReviews.length,
          pages: data.data.pagination?.pages || 1,
        });
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Error', 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          'Success',
          currentStatus ? 'Review hidden successfully' : 'Review published successfully'
        );
        fetchReviews();
      } else {
        toast.error('Error', data.message || 'Failed to update review status');
      }
    } catch (error) {
      console.error('Toggle approval error:', error);
      toast.error('Error', 'Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (user?.role !== 'superadmin') {
      toast.error('Permission Denied', 'Only Super Admins can permanently delete reviews');
      return;
    }

    if (!window.confirm('Are you sure you want to PERMANENTLY delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Success', 'Review permanently deleted');
        fetchReviews();
      } else {
        toast.error('Error', data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Error', 'Failed to delete review');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />
            Review Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage customer reviews and feedback
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews, products, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status Filter */}
            <CustomDropdown
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'approved', label: 'Published' },
                { value: 'hidden', label: 'Hidden' },
              ]}
              className="text-sm sm:text-base"
            />

            {/* Rating Filter */}
            <CustomDropdown
              value={filters.rating}
              onChange={(value) => setFilters({ ...filters, rating: value })}
              options={[
                { value: '', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
              ]}
              className="text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all ${review.isApproved
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <img
                      src={review.product.thumbnail}
                      alt={review.product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {review.product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {review.isApproved ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        Hidden
                      </span>
                    )}
                    {review.verified && (
                      <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {review.comment}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review ${idx + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* User Info & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{review.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 max-w-[200px] sm:max-w-none">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{review.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-2 lg:mt-0">
                    {/* Hide/Publish Button */}
                    <button
                      onClick={() => handleToggleApproval(review._id, review.isApproved)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${review.isApproved
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                        }`}
                    >
                      {review.isApproved ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span className="hidden sm:inline">Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Publish</span>
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    {user?.role === 'superadmin' && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status !== 'all' || filters.rating
                ? 'Try adjusting your filters'
                : 'No reviews have been submitted yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && reviews.length > 0 && pagination.pages > 1 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
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
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
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
                        onClick={() => setPagination({ ...pagination, page: pageNum })}
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
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
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

        {/* Permissions Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Your Permissions ({user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}):
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>✅ View all reviews and reviewer information</li>
            <li>✅ Hide/Publish reviews (moderate content)</li>
            <li>❌ Cannot edit review text (prevents fraud)</li>
            {user?.role === 'superadmin' ? (
              <li>✅ Permanently delete reviews</li>
            ) : (
              <li>❌ Cannot permanently delete (Super Admin only)</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
