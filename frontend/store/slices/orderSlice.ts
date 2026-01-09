import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api/client';

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
  async (orderData: { shippingAddress: ShippingAddress; paymentMethod: string; notes?: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

// Fetch user's orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/orders/my-orders', {}, dispatch as any, state);
      return data.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}`, {}, dispatch as any, state);
      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}/cancel`, {
        method: 'PUT',
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

// Admin: Fetch all orders
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (filters: { status?: string; paymentStatus?: string; page?: number; limit?: number } = {}, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const params: Record<string, string | number> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const data = await apiClient('/orders', { params }, dispatch as any, state);
      return data.data; // Returns { orders, pagination, statistics }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

// Admin: Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

// Admin: Update payment status
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePayment',
  async ({ orderId, status }: { orderId: string; status: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update payment status');
    }
  }
);

// Archive order
export const archiveOrder = createAsyncThunk(
  'orders/archive',
  async (orderId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}/archive`, {
        method: 'PUT',
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to archive order');
    }
  }
);

// Unarchive order
export const unarchiveOrder = createAsyncThunk(
  'orders/unarchive',
  async (orderId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/orders/${orderId}/unarchive`, {
        method: 'PUT',
      }, dispatch as any, state);

      return data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unarchive order');
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
        const error = action.payload as any;
        state.error = error?.message || 'Failed to fetch your orders';

        if (error?.code !== 'SESSION_EXPIRED') {
          console.error('fetchUserOrders failed:', error?.message || action.payload);
        }
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
        const error = action.payload as any;
        state.error = error?.message || 'Failed to fetch orders';

        if (error?.code !== 'SESSION_EXPIRED') {
          console.error('fetchAllOrders failed:', error?.message || action.payload);
        }
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

