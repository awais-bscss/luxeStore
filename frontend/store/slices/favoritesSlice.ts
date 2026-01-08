import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FavoriteProduct {
  _id: string;
  name: string;
  price: number;
  thumbnail?: string;
  category?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  brand?: string;
  comparePrice?: number;
  discount?: number;
}

interface FavoritesState {
  items: string[];
  products: FavoriteProduct[];
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
}

const initialState: FavoritesState = {
  items: [],
  products: [],
  isLoading: false,
  error: null,
  isSynced: false,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return {
        items: data.data.favorites.map((p: any) => p._id),
        products: data.data.favorites,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToFavoritesAPI = createAsyncThunk(
  'favorites/addToFavoritesAPI',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/favorites/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return {
        items: data.data.favorites.map((p: any) => p._id),
        products: data.data.favorites,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromFavoritesAPI = createAsyncThunk(
  'favorites/removeFromFavoritesAPI',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return {
        items: data.data.favorites.map((p: any) => p._id),
        products: data.data.favorites,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const mergeFavoritesAPI = createAsyncThunk(
  'favorites/mergeFavoritesAPI',
  async (localFavorites: string[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/favorites/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ productIds: localFavorites }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return {
        items: data.data.favorites.map((p: any) => p._id),
        products: data.data.favorites,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearFavoritesAPI = createAsyncThunk(
  'favorites/clearFavoritesAPI',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/favorites/clear`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return {
        items: [],
        products: [],
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavoriteLocal: (state, action: PayloadAction<string>) => {
      const index = state.items.indexOf(action.payload);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    removeFavoriteLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(id => id !== action.payload);
    },
    clearFavoritesLocal: (state) => {
      state.items = [];
      state.products = [];
    },
    setSynced: (state, action: PayloadAction<boolean>) => {
      state.isSynced = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.products = action.payload.products;
        state.isLoading = false;
        state.isSynced = true;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error('fetchFavorites failed:', action.payload);
      })
      .addCase(addToFavoritesAPI.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.products = action.payload.products;
        state.isSynced = true;
      })
      .addCase(addToFavoritesAPI.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error('addToFavoritesAPI failed:', action.payload);
      })
      .addCase(removeFromFavoritesAPI.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.products = action.payload.products;
        state.isSynced = true;
      })
      .addCase(removeFromFavoritesAPI.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error('removeFromFavoritesAPI failed:', action.payload);
      })
      .addCase(mergeFavoritesAPI.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.products = action.payload.products;
        state.isSynced = true;
      })
      .addCase(mergeFavoritesAPI.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error('mergeFavoritesAPI failed:', action.payload);
      })
      .addCase(clearFavoritesAPI.fulfilled, (state) => {
        state.items = [];
        state.products = [];
        state.isSynced = true;
      })
      .addCase(clearFavoritesAPI.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error('clearFavoritesAPI failed:', action.payload);
      })
      // Handle logout - reset favorites completely
      .addCase(logout.fulfilled, (state) => {
        state.items = [];           // Clear all favorite IDs
        state.products = [];         // Clear all favorite products
        state.isSynced = false;      // Reset sync flag
        state.error = null;          // Clear errors
      });
  },
});

export const {
  toggleFavoriteLocal,
  removeFavoriteLocal,
  clearFavoritesLocal,
  setSynced,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
