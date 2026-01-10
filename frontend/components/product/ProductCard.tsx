"use client";

// IMPORTS
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency, useExchangeRate } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/currency";

// COMPONENT
interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const toast = useToast();
  const { isDarkMode } = useTheme();
  const currency = useCurrency();
  const exchangeRate = useExchangeRate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();


  // Prefer _id (DB ID) over id (mock ID), but handle both
  const productId = product._id || product.id.toString();

  // Check if product is in favorites
  const isProductFavorite = isFavorite(productId);

  const handleCardClick = () => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent adding out-of-stock items
    if (product.stock === 0) {
      toast.error('Out of Stock', `${product.name} is currently out of stock`);
      return;
    }

    addToCart({
      productId: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      thumbnail: product.image,
      stock: product.stock,
    });
    toast.success('Added to Cart!', `${product.name} has been added to your cart`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(productId);

    if (isProductFavorite) {
      toast.info('Removed from Favorites', `${product.name} has been removed from your favorites`);
    } else {
      toast.success('Added to Favorites!', `${product.name} has been added to your favorites`);
    }
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/product/${productId}#reviews`);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border cursor-pointer ${isOutOfStock ? 'opacity-75' : ''
        } ${isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
        }`}
    >
      <div className={`relative h-40 sm:h-44 md:h-48 overflow-hidden ${isDarkMode
        ? 'bg-gradient-to-br from-gray-700 to-gray-800'
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
            } ${isOutOfStock ? 'grayscale' : ''}`}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-base shadow-2xl transform rotate-[-5deg]">
                OUT OF STOCK
              </div>
              <p className="text-white text-xs mt-2 font-medium">Currently Unavailable</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 sm:top-3 left-2 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 z-10 ${isProductFavorite
            ? "bg-white text-red-500 shadow-lg scale-110"
            : isDarkMode
              ? "bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:scale-110"
              : "bg-white/80 text-gray-600 hover:bg-white hover:scale-110"
            }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${isProductFavorite ? "fill-red-500" : ""
              }`}
          />
        </button>

        {/* Price Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-lg">
          {formatPrice(product.price, currency, exchangeRate)}
        </div>

        {/* Stock Warning - Only show if not out of stock */}
        {!isOutOfStock && product.stock < 20 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-red-500 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold animate-pulse">
            Only {product.stock} left
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full ${isDarkMode
            ? 'text-blue-400 bg-blue-900/50'
            : 'text-blue-600 bg-blue-50'
            }`}>
            {product.category}
          </span>
          <button
            onClick={handleRatingClick}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-200 border ${isDarkMode
              ? 'border-transparent hover:border-gray-600 hover:bg-gray-700/50'
              : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
              }`}
            title="Click to view reviews"
          >
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {product.rating?.toFixed(1) || '0.0'}
            </span>
            {product.reviewCount !== undefined && (
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                ({product.reviewCount})
              </span>
            )}
          </button>
        </div>

        <h3 className={`text-base sm:text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
          {product.name}
        </h3>

        <p className={`text-xs sm:text-sm mb-2 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
          {product.description}
        </p>

        <div className={`flex items-center justify-between text-xs mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
          <span className="font-medium">{product.brand}</span>
          <span className={isOutOfStock ? 'text-red-500 font-bold' : ''}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full font-bold py-2 sm:py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${isOutOfStock
            ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 hover:shadow-xl'
            }`}
        >
          <Plus className="w-4 h-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
