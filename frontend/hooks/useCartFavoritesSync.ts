'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { mergeCartAPI } from '../store/slices/cartSlice';
import { mergeFavoritesAPI, fetchFavorites } from '../store/slices/favoritesSlice';
import { fetchCart } from '../store/slices/cartSlice';

export const useCartFavoritesSync = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems, isSynced: cartSynced } = useAppSelector((state) => state.cart);
  const { items: favoriteItems, isSynced: favoritesSynced } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    console.log('=== CART SYNC CHECK ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('cartSynced:', cartSynced);
    console.log('cartItems:', cartItems);
    console.log('cartItems.length:', cartItems.length);

    if (isAuthenticated && !cartSynced) {
      // User just logged in, merge localStorage cart with database
      if (cartItems.length > 0) {
        console.log('⚠️ WARNING: Merging cart items (this should be empty after logout!):', cartItems);
        dispatch(mergeCartAPI(cartItems));
      } else {
        console.log('✅ Fetching cart from database (correct behavior)');
        dispatch(fetchCart());
      }
    }
  }, [isAuthenticated, cartSynced, cartItems, dispatch]);

  useEffect(() => {
    if (isAuthenticated && !favoritesSynced) {
      // User just logged in, merge localStorage favorites with database
      if (favoriteItems.length > 0) {
        console.log('Merging favorite items:', favoriteItems);
        dispatch(mergeFavoritesAPI(favoriteItems));
      } else {
        console.log('Fetching favorites from database');
        dispatch(fetchFavorites());
      }
    }
  }, [isAuthenticated, favoritesSynced, favoriteItems, dispatch]);
};
