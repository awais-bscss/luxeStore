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

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);

  const addToCart = async (product: CartItem) => {
    // Optimistic update: Add to UI immediately
    dispatch(addToCartLocal(product));

    // Then sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(addToCartAPI({ productId: product.productId, quantity: product.quantity })).unwrap();
      } catch (error) {
        console.error('Failed to add to cart on backend:', error);
        // Local update is already done, user sees instant feedback
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    // Optimistic update: Update UI immediately
    dispatch(updateQuantityLocal({ productId, quantity }));

    // Then sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(updateCartItemAPI({ productId, quantity })).unwrap();
      } catch (error) {
        console.error('Failed to update cart on backend:', error);
        // If API fails, the local update is already done, so user sees instant feedback
        // The next cart fetch will sync with backend state
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        console.log('🗑️ Removing from cart (API):', productId);
        await dispatch(removeFromCartAPI(productId)).unwrap();
        console.log('✅ Successfully removed from cart (backend updated)');
      } catch (error: any) {
        console.error('❌ FAILED to remove from cart (backend NOT updated):', error);
        console.error('Error details:', error.message || error);
        console.error('Full error object:', error);
        // DO NOT fallback to local removal - this causes the bug!
        // Log but don't throw - let the user know via console
      }
    } else {
      console.log('🗑️ Removing from cart (local only - not logged in)');
      dispatch(removeFromCartLocal(productId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        console.log('🧹 Clearing entire cart (API)');
        await dispatch(clearCartAPI()).unwrap();
        console.log('✅ Successfully cleared cart (backend updated)');
      } catch (error: any) {
        console.error('❌ FAILED to clear cart (backend NOT updated):', error);
        console.error('Error details:', error.message || error);
        console.error('Full error object:', error);
      }
    } else {
      console.log('🧹 Clearing cart (local only - not logged in)');
      dispatch(clearCartLocal());
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
