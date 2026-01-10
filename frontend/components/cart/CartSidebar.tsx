"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCart } from "@/hooks/useCart";
import { X, ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency, useExchangeRate } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/currency";
import { useToast } from "@/hooks/useToast";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const currency = useCurrency();
  const exchangeRate = useExchangeRate();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);
  const toast = useToast();

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleUpdateQuantity = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity > maxStock) {
      // Don't allow quantity to exceed stock
      return;
    }

    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity); // No await - optimistic update
    } else {
      // If quantity is 0, remove the item
      removeFromCart(productId); // No await
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId); // No await
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated && !user) {
      toast.error('Login Required', 'Please log in to proceed to checkout');
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
                Your cart is empty
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1.5">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">
                        {item.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
                        {formatPrice(item.price, currency, exchangeRate)}
                      </p>
                      {/* Stock Info */}
                      <p className={`text-xs mb-2 ${item.stock < 10 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity - 1, item.stock)
                            }
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                          </button>
                          <span className="px-2.5 text-sm font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity + 1, item.stock)
                            }
                            disabled={item.quantity >= item.stock}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(total, currency, exchangeRate)}
              </span>
            </div>

            {/* Primary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                Checkout
              </button>

              {/* View Full Cart Button */}
              <button
                onClick={handleViewCart}
                className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-xs">View Cart</span>
              </button>

              {/* Continue Shopping */}
              <button
                onClick={onClose}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 text-xs"
              >
                Continue
              </button>
            </div>

            {/* Secondary Action - Clear Cart */}
            <button
              onClick={() => setShowClearModal(true)}
              className="w-full py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium flex items-center justify-center gap-1.5 group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Clear all items
            </button>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowClearModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 z-[70] w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Clear Cart?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Keep Items
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
