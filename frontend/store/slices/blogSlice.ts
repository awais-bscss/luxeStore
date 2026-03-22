import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string; // comma-separated, split before sending
  featuredImage: string;
  isPublished: boolean;
}

interface BlogState {
  blogs: Blog[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: BlogState = {
  blogs: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Fetch all blogs (public + admin) */
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchAll',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient('/blogs', {}, dispatch as any, state);
      return data.data.blogs as Blog[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch blogs');
    }
  }
);

/** Create a new blog post */
export const createBlog = createAsyncThunk(
  'blogs/create',
  async (formData: BlogFormData, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const data = await apiClient('/blogs', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, dispatch as any, state);
      return data.data.blog as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create blog');
    }
  }
);

/** Update an existing blog post */
export const updateBlog = createAsyncThunk(
  'blogs/update',
  async (
    { id, formData }: { id: string; formData: BlogFormData },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as any;
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const data = await apiClient(`/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }, dispatch as any, state);
      return data.data.blog as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update blog');
    }
  }
);

/** Delete a blog post */
export const deleteBlog = createAsyncThunk(
  'blogs/delete',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      await apiClient(`/blogs/${id}`, { method: 'DELETE' }, dispatch as any, state);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete blog');
    }
  }
);

/** Toggle publish/unpublish */
export const toggleBlogStatus = createAsyncThunk(
  'blogs/toggleStatus',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const data = await apiClient(`/blogs/${id}/toggle-status`, {
        method: 'PATCH',
      }, dispatch as any, state);
      return data.data.blog as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle blog status');
    }
  }
);

/** Upload a blog featured image */
export const uploadBlogImage = createAsyncThunk(
  'blogs/uploadImage',
  async (file: File, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const formData = new FormData();
      formData.append('image', file);
      const data = await apiClient('/upload/blog-image', {
        method: 'POST',
        body: formData,
      }, dispatch as any, state);
      return data.data.url as string;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload image');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.blogs.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.blogs[idx] = action.payload;
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleBlogStatus.fulfilled, (state, action) => {
        const idx = state.blogs.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.blogs[idx] = action.payload;
      })
      .addCase(toggleBlogStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = blogSlice.actions;
export default blogSlice.reducer;
