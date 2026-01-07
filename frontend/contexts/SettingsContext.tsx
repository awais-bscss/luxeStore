'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode } from '../lib/currency';

interface SystemSettings {
  currency: CurrencyCode;
  baseCurrency: CurrencyCode;
  usdToPkrRate: number;
  storeName: string;
  storeEmail: string;
  // Add other settings as needed
}

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>({
    currency: 'USD',
    baseCurrency: 'PKR',
    usdToPkrRate: 279.89,
    storeName: 'LuxeStore',
    storeEmail: 'admin@luxestore.com',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async (isInitial = false) => {
    try {
      if (isInitial) {
        console.log('Fetching settings from API...');
      }

      const response = await fetch(`${API_URL}/settings`, {
        credentials: 'include',
      });

      if (isInitial) {
        console.log('Settings response status:', response.status);
      }

      if (response.ok) {
        const data = await response.json();

        if (isInitial) {
          console.log('Settings data received:', data);
        }

        if (data.success && data.data.settings) {
          const newSettings = {
            currency: data.data.settings.currency || 'USD',
            baseCurrency: data.data.settings.baseCurrency || 'PKR',
            usdToPkrRate: data.data.settings.usdToPkrRate || 279.89,
            storeName: data.data.settings.storeName || 'LuxeStore',
            storeEmail: data.data.settings.storeEmail || 'admin@luxestore.com',
          };

          if (isInitial) {
            console.log('Setting new settings:', newSettings);
          }

          setSettings(newSettings);
        }
      } else if (isInitial) {
        console.error('Failed to fetch settings, status:', response.status);
      }
    } catch (error) {
      // Only log error on initial fetch to avoid console spam
      if (isInitial) {
        console.error('Failed to fetch settings:', error);
        console.log('Using default settings');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSettings(true); // Initial fetch with logging

    // Auto-refresh settings every 30 seconds to keep all customers in sync
    // Reduced from 5 seconds to avoid excessive API calls
    const interval = setInterval(() => {
      fetchSettings(false); // Silent refresh without logging
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings(true); // Manual refresh with logging
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook to get just the currency
export function useCurrency(): CurrencyCode {
  const { settings } = useSettings();
  return settings.currency;
}

// Hook to get the exchange rate
export function useExchangeRate(): number {
  const { settings } = useSettings();
  return settings.usdToPkrRate;
}
