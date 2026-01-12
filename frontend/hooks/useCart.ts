import { useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal,
  clearCartLocal,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI,
  CartItem,
} from '@/store/slices/cartSlice';

// Simple debounce function for the hook
const debouncedSyncs: Record<string, NodeJS.Timeout> = {};

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);

  // Track pending quantity updates to avoid race conditions
  const pendingUpdates = useRef<Record<string, number>>({});

  const addToCart = async (product: CartItem) => {
    // Optimistic update: Add to UI immediately
    dispatch(addToCartLocal(product));

    // Then sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(addToCartAPI({ productId: product.productId, quantity: product.quantity })).unwrap();
      } catch (error) {
        console.error('Failed to add to cart on backend:', error);
      }
    }
  };

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    // 1. Optimistic update: Update UI immediately
    dispatch(updateQuantityLocal({ productId, quantity }));

    // 2. Track this update locally
    pendingUpdates.current[productId] = quantity;

    // 3. Debounced sync with backend if authenticated
    if (isAuthenticated) {
      // Clear existing timeout for this product
      if (debouncedSyncs[productId]) {
        clearTimeout(debouncedSyncs[productId]);
      }

      // Set new timeout
      debouncedSyncs[productId] = setTimeout(async () => {
        const finalQuantity = pendingUpdates.current[productId];

        try {
          console.log(`🔄 Syncing final quantity ${finalQuantity} for ${productId}`);
          await dispatch(updateCartItemAPI({ productId, quantity: finalQuantity })).unwrap();
          // Clear pending after successful sync
          delete pendingUpdates.current[productId];
        } catch (error) {
          console.error('Failed to update cart on backend:', error);
        } finally {
          delete debouncedSyncs[productId];
        }
      }, 500); // 500ms debounce
    }
  }, [dispatch, isAuthenticated]);

  const removeFromCart = async (productId: string) => {
    // Clear any pending syncs for this product
    if (debouncedSyncs[productId]) {
      clearTimeout(debouncedSyncs[productId]);
      delete debouncedSyncs[productId];
    }
    delete pendingUpdates.current[productId];

    // Optimistic update: Remove from UI immediately
    dispatch(removeFromCartLocal(productId));

    // Then sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartAPI(productId)).unwrap();
      } catch (error: any) {
        console.error('❌ FAILED to remove from cart on backend:', error);
      }
    }
  };

  const clearCart = async () => {
    // Clear all pending syncs
    Object.values(debouncedSyncs).forEach(timeout => clearTimeout(timeout));
    Object.keys(debouncedSyncs).forEach(key => delete debouncedSyncs[key]);
    pendingUpdates.current = {};

    // Optimistic update: Clear UI immediately
    dispatch(clearCartLocal());

    // Then sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(clearCartAPI()).unwrap();
      } catch (error: any) {
        console.error('❌ FAILED to clear cart on backend:', error);
      }
    }
  };

  return {
    ...cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};
