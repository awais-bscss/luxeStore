import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
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

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.cart.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAPI = createAsyncThunk(
  'cart/addToCartAPI',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.cart.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemAPI = createAsyncThunk(
  'cart/updateCartItemAPI',
  async ({ productId, quantity }: { productId: string; quantity: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.cart.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart/${productId}`, {
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

      return data.data.cart.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const mergeCartAPI = createAsyncThunk(
  'cart/mergeCartAPI',
  async (localItems: CartItem[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ items: localItems }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.cart.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  'cart/clearCartAPI',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/cart`, {
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

      return []; // Return empty array since cart is cleared
    } catch (error: any) {
      return rejectWithValue(error.message);
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
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push(action.payload);
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
        item.quantity = Math.max(1, action.payload.quantity);
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
        state.error = action.payload as string;
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
        console.log('Cart items before clear:', state.items);
        state.items = [];           // Clear all cart items
        state.total = 0;             // Reset total
        state.isSynced = false;      // Reset sync flag
        state.error = null;          // Clear errors
        console.log('Cart items after clear:', state.items);
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
