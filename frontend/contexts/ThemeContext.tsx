'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleDarkMode, toggleCompactView, toggleSidebarCollapsed } from '@/store/slices/themeSlice';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCompactView: boolean;
  toggleCompactView: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isDarkMode, isCompactView, isSidebarCollapsed } = useAppSelector((state) => state.theme);

  // Apply theme classes on mount and when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isCompactView) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [isCompactView]);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleToggleCompactView = () => {
    dispatch(toggleCompactView());
  };

  const handleToggleSidebarCollapsed = () => {
    dispatch(toggleSidebarCollapsed());
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode: handleToggleDarkMode,
      isCompactView,
      toggleCompactView: handleToggleCompactView,
      isSidebarCollapsed,
      toggleSidebarCollapsed: handleToggleSidebarCollapsed
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
