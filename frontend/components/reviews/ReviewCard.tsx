"use client";

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ThumbsUp, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ReviewCardProps {
  review: {
    _id: string;
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
    createdAt: string;
  };
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onHelpful,
}) => {
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isDeleting, setIsDeleting] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const isOwner = user?.id === review.user._id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_URL}/reviews/${review._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Success', 'Review deleted successfully');
        if (onDelete) {
          onDelete(review._id);
        }
      } else {
        toast.error('Error', data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error', 'An error occurred while deleting the review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) {
      toast.error('Already Marked', 'You have already marked this review as helpful');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/${review._id}/helpful`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHelpfulCount(helpfulCount + 1);
        setHasMarkedHelpful(true);
        toast.success('Success', 'Thank you for your feedback!');
        if (onHelpful) {
          onHelpful(review._id);
        }
      } else {
        toast.error('Error', data.message || 'Failed to mark as helpful');
      }
    } catch (error) {
      console.error('Helpful error:', error);
      toast.error('Error', 'An error occurred');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {review.user.name.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {review.user.name}
              </h4>
              {review.verified && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Verified Purchase
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit review"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {review.title}
      </h3>

      {/* Comment */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${hasMarkedHelpful
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
          Helpful ({helpfulCount})
        </button>
      </div>
    </div>
  );
};
