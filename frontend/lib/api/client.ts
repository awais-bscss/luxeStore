import { logout } from '@/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Production-ready API client wrapper for fetch.
 * Handles base URL, auth tokens, and global error scenarios like session expiration.
 */
export async function apiClient(
  endpoint: string,
  options: RequestOptions = {},
  dispatch?: AppDispatch,
  state?: RootState
) {
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
  if (!headers.has('Authorization') && state?.auth?.token) {
    headers.set('Authorization', `Bearer ${state.auth.token}`);
  }

  // Set default Content-Type for JSON requests
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
      dispatch(logout());
      // The calling component or a global listener can handle the redirect logic
      // by reacting to the auth state change.
    }

    // Add common error handling logic here
    // e.g., for 500s or maintenance mode

    return response;
  } catch (error) {
    console.error(`API Call failed: ${url}`, error);
    throw error;
  }
}
