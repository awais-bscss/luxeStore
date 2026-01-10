import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { logout } from '@/store/slices/authSlice';
import { apiClient, ApiResponse } from '@/lib/api/client';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  stock: number; // Available stock for this product
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  isSynced: false,
};

// Helper to map API cart items to local CartItem type
const mapApiCartItems = (items: any[]): CartItem[] => {
  return items.map((item: any) => ({
    productId: item.product?._id || item.productId,
    name: item.product?.name || item.name,
    price: item.price,
    quantity: item.quantity,
    thumbnail: item.product?.thumbnail || item.thumbnail,
    stock: item.product?.stock || item.stock || 0,
  }));
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/cart', {}, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return mapApiCartItems(data.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAPI = createAsyncThunk(
  'cart/addToCartAPI',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return mapApiCartItems(data.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItemAPI = createAsyncThunk(
  'cart/updateCartItemAPI',
  async ({ productId, quantity }: { productId: string; quantity: number }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return mapApiCartItems(data.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update item');
    }
  }
);

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async (productId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/cart/${productId}`, {
        method: 'DELETE',
      }, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return mapApiCartItems(data.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item');
    }
  }
);

export const mergeCartAPI = createAsyncThunk(
  'cart/mergeCartAPI',
  async (localItems: CartItem[], { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ items: localItems }),
      }, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return mapApiCartItems(data.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to merge cart');
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  'cart/clearCartAPI',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/cart', {
        method: 'DELETE',
      }, dispatch as any, state);

      if (!data.success) {
        throw new Error(data.message);
      }

      return []; // Return empty array since cart is cleared
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);

      if (existingItem) {
        // Enforce stock limit
        const totalRequested = existingItem.quantity + (action.payload.quantity || 1);
        existingItem.quantity = Math.min(totalRequested, existingItem.stock);
      } else {
        // Enforce stock limit on initial add
        const initialQuantity = Math.min(action.payload.quantity || 1, action.payload.stock);
        state.items.push({
          ...action.payload,
          quantity: initialQuantity
        });
      }

      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateQuantityLocal: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.productId === action.payload.productId);
      if (item) {
        // Enforce stock limit
        const validatedQuantity = Math.min(action.payload.quantity, item.stock);
        item.quantity = Math.max(1, validatedQuantity);
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.total = 0;
    },
    setSynced: (state, action: PayloadAction<boolean>) => {
      state.isSynced = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        state.isLoading = false;
        state.isSynced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as any;
        state.error = error?.message || 'Failed to fetch cart';

        if (error?.code !== 'SESSION_EXPIRED') {
          console.error('fetchCart failed:', error?.message || action.payload);
        }
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        state.isSynced = true;
      })
      .addCase(addToCartAPI.rejected, (state, action) => {

        state.error = action.payload as string;
      })
      .addCase(updateCartItemAPI.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        state.isSynced = true;
      })
      .addCase(updateCartItemAPI.rejected, (state, action) => {

        state.error = action.payload as string;
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        state.isSynced = true;
      })
      .addCase(removeFromCartAPI.rejected, (state, action) => {

        state.error = action.payload as string;
      })
      .addCase(mergeCartAPI.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = action.payload.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        state.isSynced = true;
      })
      .addCase(mergeCartAPI.rejected, (state, action) => {

        state.error = action.payload as string;
      })
      .addCase(clearCartAPI.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.isSynced = true;
      })
      .addCase(clearCartAPI.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Handle logout - reset cart completely
      .addCase(logout.fulfilled, (state) => {
        console.log('🔴 LOGOUT: Clearing cart state');

        // If there were items, optionally back them up to localStorage 
        // specifically for session re-login restoration
        if (state.items.length > 0 && typeof window !== 'undefined') {
          localStorage.setItem('expired_session_cart', JSON.stringify(state.items));
        }

        state.items = [];           // Clear all cart items
        state.total = 0;             // Reset total
        state.isSynced = false;      // Reset sync flag
        state.error = null;          // Clear errors
      });
  },
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal,
  clearCartLocal,
  setSynced,
} = cartSlice.actions;

export default cartSlice.reducer;
