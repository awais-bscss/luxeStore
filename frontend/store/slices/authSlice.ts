import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  isEmailVerified?: boolean;
  profileImage?: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
  twoFactorUserId: string | null;
  isPasswordExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresTwoFactor: false,
  twoFactorUserId: null,
  isPasswordExpired: false,
};

// Initial state and types remain the same, apiClient handles API_URL from env

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: { name: string; email: string; password: string; role?: 'user' | 'admin' | 'superadmin' }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, dispatch as any, state);

      return { token: data.token, user: data.user || data.data?.user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, dispatch as any, state);

      console.log('API Response data from /auth/login:', data);

      // Check if 2FA is required (some endpoints return 200 with requiresTwoFactor: true)
      if (data.requiresTwoFactor) {
        console.log('2FA required flag detected in response');
        return rejectWithValue({
          requiresTwoFactor: true,
          userId: data.userId,
          message: data.message,
        });
      }

      const loginPayload = {
        token: data.token,
        user: data.user || data.data?.user,
        passwordExpired: data.passwordExpired || false
      };

      console.log('Returning login success payload:', loginPayload);

      // Normal login (no 2FA)
      return loginPayload;
    } catch (error: any) {
      // Check if 2FA is required from the error response
      if (error.status === 401 && error.data?.requiresTwoFactor) {
        return rejectWithValue({
          requiresTwoFactor: true,
          userId: error.data.userId,
          message: error.message,
        });
      }
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      await apiClient('/auth/logout', {
        method: 'POST',
      }, dispatch as any, state);

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/auth/profile', {}, dispatch as any, state);
      return data.user || data.data?.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.requiresTwoFactor = false;
      state.twoFactorUserId = null;
      state.isPasswordExpired = false;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setEmailVerified: (state) => {
      if (state.user) {
        state.user.isEmailVerified = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('=== LOGIN FULFILLED REDUCER ===');
        console.log('Action payload:', action.payload);

        if (!action.payload) {
          console.error('Login fulfilled but payload is missing');
          state.isLoading = false;
          state.error = 'Login failed: missing response data';
          return;
        }

        console.log('User from payload:', action.payload.user);
        console.log('User role from payload:', action.payload.user?.role);

        state.isLoading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isPasswordExpired = !!action.payload.passwordExpired;
        state.isAuthenticated = true;
        state.error = null;

        console.log('State after update:', { user: state.user, role: state.user?.role });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;

        // Check if this is a 2FA requirement (not an actual error)
        const payload = action.payload as any;
        if (payload && typeof payload === 'object' && payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          state.twoFactorUserId = payload.userId;
          state.error = null; // Not an error, just needs 2FA
        } else {
          state.requiresTwoFactor = false;
          state.twoFactorUserId = null;
          state.isPasswordExpired = false;
          state.error = typeof payload === 'string' ? payload : 'Login failed';
        }
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isPasswordExpired = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setCredentials, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;
