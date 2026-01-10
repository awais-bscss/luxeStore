'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addToCartLocal } from '@/store/slices/cartSlice';
import { toggleFavoriteLocal } from '@/store/slices/favoritesSlice';
import { RootState } from '@/store/store';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { formatPrice } from '@/lib/currency';
import { useSettings } from '@/contexts/SettingsContext';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api/client';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  thumbnail: string;
  images: string[];
  tags: string[];
  specifications: { key: string; value: string }[];
  isActive: boolean;
  isFeatured: boolean;
  discount?: number;
  rating: number;
  reviewCount: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state);
  const [cartOpen, setCartOpen] = useState(false);
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [reviewStats, setReviewStats] = useState<any>(null);

  const favoriteIds = useAppSelector((state: RootState) => state.favorites.items);
  const isFavorite = favoriteIds.includes(productId);

  useEffect(() => {
    fetchProduct();
    fetchReviewStats();
  }, [productId]);

  // Handle hash navigation (e.g., #reviews)
  useEffect(() => {
    if (window.location.hash === '#reviews') {
      scrollToReviews();
    }
  }, []);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient(`/products/${productId}`, {}, dispatch, state);

      if (data.success) {
        setProduct(data.data.product);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Error', error.message || 'Failed to load product');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const data = await apiClient(`/reviews/product/${productId}/stats`, {}, dispatch, state);
      if (data.success) {
        setReviewStats(data.data.stats);
      }
    } catch (error) {
      console.error('Fetch review stats error:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCartLocal({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        thumbnail: product.thumbnail,
        stock: product.stock,
      })
    );
    toast.success('Added to Cart', `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`);
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    dispatch(toggleFavoriteLocal(product._id));
    toast.success(
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      isFavorite ? 'Product removed from your favorites' : 'Product added to your favorites'
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Product link copied to clipboard');
    }
  };

  const calculateDiscount = () => {
    if (!product?.comparePrice || !product?.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      const reviewsSection = document.getElementById('reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  const allImages = [product.thumbnail, ...(product.images || [])];
  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href={`/?category=${product.category}`} className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  -{discount}%
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute top-4 right-4 z-10 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Out of Stock
                </div>
              )}
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border transition-all ${selectedImage === index
                      ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-1 dark:ring-offset-gray-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                      }`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.brand && (
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">{product.name}</h1>

              {/* Rating */}
              <button
                onClick={scrollToReviews}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">({product.reviewCount} reviews)</span>
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price, settings.currency, settings.usdToPkrRate)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.comparePrice, settings.currency, settings.usdToPkrRate)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-4 border rounded-xl transition-all ${isFavorite
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-600 dark:text-gray-400 transition-all"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Free Shipping</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Secure Payment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Easy Returns</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">30-day policy</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div id="reviews-section" className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'description'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'specifications'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'reviews'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3">
                {product.specifications && product.specifications.length > 0 ? (
                  product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{spec.key}</span>
                      <span className="text-gray-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Review Statistics */}
                {reviewStats && <ReviewStats stats={reviewStats} />}

                {/* Review List */}
                <ReviewList productId={productId} onReviewChange={fetchReviewStats} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
