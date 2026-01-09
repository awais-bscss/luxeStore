import { logout } from '@/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  // Common top-level properties (handling backend inconsistencies)
  token?: string;
  user?: any;
  requiresTwoFactor?: boolean;
  userId?: string;
  passwordExpired?: boolean;
}

/**
 * Production-ready API client wrapper for fetch.
 * Handles base URL, auth tokens, automatic JSON parsing, and global error scenarios.
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  dispatch?: AppDispatch,
  state?: RootState
): Promise<ApiResponse<T>> {
  const { params, headers: customHeaders, ...restOptions } = options;

  // Build URL with query params if provided
  let url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Set up headers
  const headers = new Headers(customHeaders);

  // Auto-inject Auth Token if not explicitly provided
  const token = state?.auth?.token;
  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default Content-Type for JSON requests
  // Important: Fetch handles boundary automatically for FormData if Content-Type is NOT set
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      credentials: 'include',
    });

    // Global session expiration handling (401 Unauthorized)
    if (response.status === 401 && dispatch) {
      console.warn('Session expired - triggering logout');
      dispatch(logout());
      // Throw standard error object for handling in thunks
      throw {
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Please log in again.',
        status: 401
      };
    }

    // Attempt to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (text, etc)
      const text = await response.text();
      data = { success: response.ok, message: text, data: null };
    }

    if (!response.ok) {
      // Throw descriptive error with server message if available
      throw {
        code: 'API_ERROR',
        message: data.message || `Request failed with status ${response.status}`,
        status: response.status,
        data: data.data
      };
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    // If it's already a shaped error we threw, re-throw it
    if (error.code) throw error;

    // Otherwise, handle network or unexpected errors
    console.error(`API Call failed: ${url}`, error);
    throw {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection.',
      error: error.message
    };
  }
}
