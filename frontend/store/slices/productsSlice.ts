import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../data/products';
import { ProductsState } from '../../data/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// THUNKS
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Map API response to Product interface
      // Parse SKU to get numeric ID for compatibility with existing components
      return data.data.products.map((p: any) => {
        let id = 0;
        if (p.sku && p.sku.startsWith('SKU-')) {
          id = parseInt(p.sku.replace('SKU-', ''));
        }

        return {
          id: id || Math.floor(Math.random() * 100000), // Fallback
          _id: p._id,
          name: p.name,
          price: p.price,
          description: p.description,
          image: p.thumbnail || p.images[0] || '',
          category: p.category,
          rating: p.rating,
          reviewCount: p.reviewCount,
          stock: p.stock,
          brand: p.brand,
          thumbnail: p.thumbnail,
          comparePrice: p.comparePrice,
          discount: p.discount,
        } as Product;
      });

    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: ProductsState = {
  products: [], // Start empty, load from backend
  filteredProducts: [],
  searchQuery: '',
  selectedCategory: 'All',
  isLoading: false,
  error: null
};

// SLICE CREATION
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredProducts = state.products.filter(p =>
        (state.selectedCategory === 'All' || p.category === state.selectedCategory) &&
        p.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.filteredProducts = state.products.filter(p =>
        (action.payload === 'All' || p.category === action.payload) &&
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.products = action.payload;
        // Re-apply filters
        state.filteredProducts = state.products.filter(p =>
          (state.selectedCategory === 'All' || p.category === state.selectedCategory) &&
          p.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// EXPORTS
export const { setSearchQuery, setCategory } = productsSlice.actions;
export default productsSlice.reducer;
