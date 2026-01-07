import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent" />
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group relative rounded-2xl shadow-sm overflow-hidden border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 md:h-64 bg-gray-200 dark:bg-gray-700">
        <Skeleton className="w-full h-full" />

        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
        </div>

        {/* Price Badge Skeleton */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
          <Skeleton className="h-6 w-16 sm:w-20 rounded-full" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 md:p-6 space-y-3">
        {/* Category and Rating Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Brand and Stock Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Add to Cart Button */}
        <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative h-[600px] bg-gray-200 dark:bg-gray-800 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 px-6 max-w-4xl">
          <Skeleton className="h-16 w-96 mx-auto" />
          <Skeleton className="h-8 w-full max-w-2xl mx-auto" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-14 w-40" />
            <Skeleton className="h-14 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};

export const CategoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const FeaturedProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image */}
        <Skeleton className="h-96 md:h-full w-full" />

        {/* Content */}
        <div className="p-8 md:p-12 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Skeleton className="h-6 w-20 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <Skeleton className="aspect-square w-full rounded-2xl" />

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full mb-3" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Stock */}
            <Skeleton className="h-6 w-40" />

            {/* Quantity */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="flex-1 h-14 m-2 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="p-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};
