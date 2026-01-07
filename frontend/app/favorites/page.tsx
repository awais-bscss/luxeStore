"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { ProductCard } from "../../components/product/ProductCard";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { useCart } from "../../hooks/useCart";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { fetchProducts } from "../../store/slices/productsSlice";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useToast } from "../../hooks/useToast";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";

export default function FavoritesPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const toast = useToast();
  const { items } = useCart();
  const { items: favoriteIds, products: favoriteProducts, clearFavorites } = useFavorites();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { products: storeProducts } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Ensure products are fetched so we can display them for guests
    if (!isAuthenticated && storeProducts.length <= 12) {
      dispatch(fetchProducts());
    }
  }, [dispatch, isAuthenticated, storeProducts.length]);

  // For guest users, get products from store (fetched from API)
  const displayProducts = isAuthenticated
    ? favoriteProducts
    : storeProducts.filter(p => favoriteIds.includes(p._id || '') || favoriteIds.includes(p.id.toString()));

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">My Favorites</h1>
                <p className="text-xl text-blue-100">{displayProducts?.length || 0} saved products</p>
              </div>
            </div>
            {(displayProducts?.length || 0) > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <Trash2 className="w-5 h-5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {(displayProducts?.length || 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isAuthenticated ? (
              // Authenticated users - show products from API (FavoriteProduct)
              displayProducts?.map((product) => (
                <ProductCard key={product._id} product={{
                  id: parseInt(product._id) || 0, // Fallback for Props
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.thumbnail || '/placeholder-product.jpg',
                  description: product.description || '',
                  category: product.category || '',
                  rating: product.rating || 0,
                  reviewCount: product.reviewCount || 0,
                  stock: product.stock || 0,
                  brand: product.brand || '',
                  comparePrice: product.comparePrice,
                  discount: product.discount,
                }} />
              ))
            ) : (
              // Guest users - show products from store (Product)
              displayProducts?.map((product) => {
                // Type guard to ensure we're working with Product type
                const prod = product as any;
                return (
                  <ProductCard key={prod._id || prod.id} product={{
                    ...prod,
                    id: prod.id || parseInt(prod._id) || 0,
                    image: prod.image || prod.thumbnail || '/placeholder-product.jpg',
                  }} />
                );
              })
            )}
          </div>
        ) : (
          <div className={`rounded-3xl shadow-xl p-12 text-center border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                <Heart className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Favorites Yet</h2>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Start adding products to your favorites by clicking the heart icon on any product card!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Clear Favorites Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          clearFavorites();
          toast.success('Favorites Cleared', 'All favorites have been removed');
        }}
        title="Clear All Favorites?"
        message="Are you sure you want to remove all products from your favorites? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
      />

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

