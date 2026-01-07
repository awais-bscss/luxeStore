import { useAppDispatch, useAppSelector } from './useRedux';
import {
  toggleFavoriteLocal,
  removeFavoriteLocal,
  clearFavoritesLocal,
  addToFavoritesAPI,
  removeFromFavoritesAPI,
  clearFavoritesAPI,
} from '../store/slices/favoritesSlice';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const favorites = useAppSelector((state) => state.favorites);

  const toggleFavorite = async (productId: string) => {
    if (isAuthenticated) {
      const isFavorite = favorites.items.includes(productId);
      try {
        if (isFavorite) {
          await dispatch(removeFromFavoritesAPI(productId)).unwrap();
        } else {
          await dispatch(addToFavoritesAPI(productId)).unwrap();
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        dispatch(toggleFavoriteLocal(productId));
      }
    } else {
      dispatch(toggleFavoriteLocal(productId));
    }
  };

  const removeFavorite = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await dispatch(removeFromFavoritesAPI(productId)).unwrap();
      } catch (error) {
        console.error('Failed to remove favorite:', error);
        dispatch(removeFavoriteLocal(productId));
      }
    } else {
      dispatch(removeFavoriteLocal(productId));
    }
  };

  const clearFavorites = async () => {
    if (isAuthenticated) {
      try {
        console.log('🧹 Clearing all favorites (API)');
        await dispatch(clearFavoritesAPI()).unwrap();
        console.log('✅ Successfully cleared favorites (backend updated)');
      } catch (error: any) {
        console.error('❌ FAILED to clear favorites (backend NOT updated):', error);
        console.error('Error details:', error.message || error);
      }
    } else {
      console.log('🧹 Clearing favorites (local only - not logged in)');
      dispatch(clearFavoritesLocal());
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.items.includes(productId);
  };

  return {
    ...favorites,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
  };
};
