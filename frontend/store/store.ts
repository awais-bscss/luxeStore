import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import favoritesReducer from './slices/favoritesSlice';
import toastReducer from './slices/toastSlice';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import orderReducer from './slices/orderSlice';

// PERSIST CONFIGURATION
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'favorites', 'auth', 'theme'], // Persist cart, favorites, auth, and theme
};

// COMBINE REDUCERS
const appReducer = combineReducers({
  cart: cartReducer,
  products: productsReducer,
  favorites: favoritesReducer,
  toast: toastReducer,
  auth: authReducer,
  theme: themeReducer,
  orders: orderReducer,
});

// ROOT REDUCER WITH LOGOUT RESET
const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout/fulfilled') {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persist:root');
    }
    // Reset all state to initial
    state = undefined;
  }
  return appReducer(state, action);
};

// PERSISTED REDUCER
const persistedReducer = persistReducer(persistConfig, rootReducer);

// STORE CONFIGURATION
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// PERSISTOR
export const persistor = persistStore(store);

// TYPE EXPORTS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
