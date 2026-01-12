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
import { motion, AnimatePresence } from "framer-motion";

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
      toast.error('Out of Stock', `Only ${maxStock} items available`);
      return;
    }

    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      removeFromCart(productId);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
        )}

        {isOpen && (
          <motion.div
            key="cart-sidebar-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Shopping Cart
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 transform hover:rotate-90"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-900 dark:hover:text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
              {items.length === 0 ? (
                <motion.div
                  key="empty-cart-msg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-900 dark:text-white text-lg font-bold">
                    Your cart is empty
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-[200px] mx-auto">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        key={item.productId || `cart-item-${index}`}
                        className="group bg-white dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl shadow-sm"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl pointer-events-none" />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.name}
                                </h3>
                                <button
                                  onClick={() => handleRemoveItem(item.productId)}
                                  className="p-1 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-blue-600 dark:text-blue-400 font-extrabold text-sm mt-1">
                                {formatPrice(item.price, currency, exchangeRate)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                                <button
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.stock)}
                                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.stock)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                {item.stock - item.quantity} left
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(total, currency, exchangeRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {formatPrice(total, currency, exchangeRate)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCheckout}
                    className="col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20 hover:shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={handleViewCart}
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    View Cart
                  </button>
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-2xl transition-all hover:bg-red-100 dark:hover:bg-red-900/20 text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              key="clear-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              key="clear-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trash2 className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Clear all items?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                This will remove all products from your shopping cart. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 text-sm"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


