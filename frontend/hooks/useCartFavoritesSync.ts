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
    if (isAuthenticated && !cartSynced) {
      // 1. Check for backed up cart from an expired session
      const savedCart = localStorage.getItem('expired_session_cart');
      let itemsToMerge = [...cartItems];

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            console.log('🔄 Restoring items from expired session:', parsedCart);
            // Append saved items that aren't already in the current local cartItems (though cartItems should be empty)
            itemsToMerge = [...parsedCart];
          }
          // Clear it so we don't restore it again
          localStorage.removeItem('expired_session_cart');
        } catch (e) {
          console.error('Failed to parse saved cart:', e);
          localStorage.removeItem('expired_session_cart');
        }
      }

      // 2. Perform merge or fetch
      if (itemsToMerge.length > 0) {
        console.log('⚠️ Merging cart items:', itemsToMerge);
        dispatch(mergeCartAPI(itemsToMerge));
      } else {
        console.log('✅ Fetching cart from database');
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
