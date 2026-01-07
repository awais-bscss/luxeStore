import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
  isCompactView: boolean;
  isSidebarCollapsed: boolean;
}

const initialState: ThemeState = {
  isDarkMode: false,
  isCompactView: false,
  isSidebarCollapsed: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setCompactView: (state, action: PayloadAction<boolean>) => {
      state.isCompactView = action.payload;
    },
    toggleCompactView: (state) => {
      state.isCompactView = !state.isCompactView;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
  },
});

export const {
  setDarkMode,
  toggleDarkMode,
  setCompactView,
  toggleCompactView,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
} = themeSlice.actions;

export default themeSlice.reducer;
