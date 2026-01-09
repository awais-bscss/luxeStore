'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useToast } from './useToast';
import { logout } from '../store/slices/authSlice';
import { mergeCartAPI } from '../store/slices/cartSlice';
import { mergeFavoritesAPI, fetchFavorites } from '../store/slices/favoritesSlice';
import { fetchCart } from '../store/slices/cartSlice';

export const useCartFavoritesSync = () => {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems, isSynced: cartSynced } = useAppSelector((state) => state.cart);
  const { items: favoriteItems, isSynced: favoritesSynced } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && !cartSynced) {
        try {
          // 1. Check for backed up cart from an expired session
          const savedCart = localStorage.getItem('expired_session_cart');
          let itemsToMerge = [...cartItems];

          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                console.log('🔄 Restoring items from expired session:', parsedCart);
                itemsToMerge = [...parsedCart];
              }
              localStorage.removeItem('expired_session_cart');
            } catch (e) {
              console.error('Failed to parse saved cart:', e);
              localStorage.removeItem('expired_session_cart');
            }
          }

          // 2. Perform merge or fetch
          if (itemsToMerge.length > 0) {
            console.log('⚠️ Merging cart items:', itemsToMerge);
            await dispatch(mergeCartAPI(itemsToMerge)).unwrap();
          } else {
            console.log('✅ Fetching cart from database');
            await dispatch(fetchCart()).unwrap();
          }
        } catch (error: any) {
          if (error?.code === 'SESSION_EXPIRED') {
            toast.error('Session Expired', 'Your session has expired. Please log in again to access your cart.');
            dispatch(logout());
            setTimeout(() => {
              router.push('/login?redirect=/cart&reason=session_expired');
            }, 1500);
          }
        }
      }
    };

    syncCart();
  }, [isAuthenticated, cartSynced, dispatch, router, toast]);

  useEffect(() => {
    const syncFavorites = async () => {
      if (isAuthenticated && !favoritesSynced) {
        try {
          // User just logged in, merge localStorage favorites with database
          if (favoriteItems.length > 0) {
            console.log('Merging favorite items:', favoriteItems);
            await dispatch(mergeFavoritesAPI(favoriteItems)).unwrap();
          } else {
            console.log('Fetching favorites from database');
            await dispatch(fetchFavorites()).unwrap();
          }
        } catch (error: any) {
          // Check if this is a session expiration error
          if (error?.code === 'SESSION_EXPIRED') {
            toast.error('Session Expired', 'Your session has expired. Please log in again to access your favorites.');
            dispatch(logout());
            setTimeout(() => {
              router.push('/login?redirect=/favorites&reason=session_expired');
            }, 1500);
          }
        }
      }
    };

    syncFavorites();
  }, [isAuthenticated, favoritesSynced, dispatch, router, toast]);
};
