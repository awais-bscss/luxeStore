import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: { name: string; email: string; password: string; role?: 'user' | 'admin' | 'superadmin' }, { rejectWithValue }) => {
    try {
      console.log('=== REDUX SIGNUP THUNK ===');
      console.log('Received credentials:', credentials);
      console.log('Email received:', credentials.email); // Debug
      console.log('Role in credentials:', credentials.role);
      console.log('Stringified body:', JSON.stringify(credentials));

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Signup failed');
      }

      return { token: data.token, user: data.user || data.data.user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log('=== LOGIN API RESPONSE ===');
      console.log('Full response:', data);

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        console.log('2FA required for user:', data.userId);
        // Return special response indicating 2FA is needed
        return rejectWithValue({
          requiresTwoFactor: true,
          userId: data.userId,
          message: data.message,
        });
      }

      // Normal login (no 2FA)
      const result = {
        token: data.token,
        user: data.user || data.data.user,
        passwordExpired: data.passwordExpired || false
      };
      console.log('Returning to Redux:', result);

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return rejectWithValue('Logout failed');
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch profile');
      }

      return data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
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
        state.user = action.payload.user;
        state.token = action.payload.token;
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
        console.log('User from payload:', action.payload.user);
        console.log('User role from payload:', action.payload.user?.role);

        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isPasswordExpired = action.payload.passwordExpired;
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
