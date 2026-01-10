"use client";

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { X, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { apiClient } from '@/lib/api/client';

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}



export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}) => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const state = { auth } as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    images: existingReview?.images || [],
  });

  const [errors, setErrors] = useState({
    rating: '',
    title: '',
    comment: '',
  });

  const validateForm = () => {
    const newErrors = {
      rating: '',
      title: '',
      comment: '',
    };

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.length > 1000) {
      newErrors.comment = 'Comment must be 1000 characters or less';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = existingReview
        ? `/reviews/${existingReview._id}`
        : `/reviews`;

      const method = existingReview ? 'PUT' : 'POST';

      const body = existingReview
        ? formData
        : { ...formData, product: productId };

      await apiClient(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }, dispatch, state);

      toast.success(
        'Success',
        existingReview ? 'Review updated successfully' : 'Review submitted successfully'
      );
      onSuccess();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Error', error.message || 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && formData.images.length < 5) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    } else if (formData.images.length >= 5) {
      toast.error('Limit Reached', 'You can only add up to 5 images');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Rating *
        </label>
        <StarRating
          rating={formData.rating}
          onRatingChange={(rating) => {
            setFormData({ ...formData, rating });
            setErrors({ ...errors, rating: '' });
          }}
          size="lg"
        />
        {errors.rating && (
          <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          Review Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            setErrors({ ...errors, title: '' });
          }}
          placeholder="Summarize your experience"
          maxLength={100}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600'
            }`}
        />
        <div className="flex justify-between mt-1">
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {formData.title.length}/100
          </p>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          Your Review *
        </label>
        <textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => {
            setFormData({ ...formData, comment: e.target.value });
            setErrors({ ...errors, comment: '' });
          }}
          placeholder="Share your thoughts about this product..."
          rows={5}
          maxLength={1000}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${errors.comment
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600'
            }`}
        />
        <div className="flex justify-between mt-1">
          {errors.comment && (
            <p className="text-red-500 text-xs">{errors.comment}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {formData.comment.length}/1000
          </p>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Images (Optional)
        </label>
        <div className="space-y-3">
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Add Image URL ({formData.images.length}/5)
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>{existingReview ? 'Update Review' : 'Submit Review'}</>
          )}
        </button>
      </div>
    </form>
  );
};
