import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'card' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: {
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
  };
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  statistics: {
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  },
};

// Create order
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: { shippingAddress: ShippingAddress; paymentMethod: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user's orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin: Fetch all orders
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (filters: { status?: string; paymentStatus?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_URL}/orders?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data; // Returns { orders, pagination }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin: Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin: Update payment status
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePayment',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Archive order
export const archiveOrder = createAsyncThunk(
  'orders/archive',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/archive`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Unarchive order
export const unarchiveOrder = createAsyncThunk(
  'orders/unarchive',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/unarchive`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      // Fetch all orders (admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.statistics = action.payload.statistics;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update order status (admin)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      // Update payment status (admin)
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      // Archive order
      .addCase(archiveOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      // Unarchive order
      .addCase(unarchiveOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;

