'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../../hooks/useRedux';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSettings, useCurrency } from '../../../contexts/SettingsContext';
import { useToast } from '../../../hooks/useToast';
import CustomDropdown from '../../../components/ui/CustomDropdown';
import {
  Globe,
  Shield,
  Bell,
  CreditCard,
  Truck,
  Palette,
  Database,
  Save,
  X,
  Copy,
  Check,
  Smartphone,
  Moon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { isDarkMode, toggleDarkMode, isCompactView, toggleCompactView, isSidebarCollapsed, toggleSidebarCollapsed } = useTheme();
  const { refreshSettings } = useSettings();
  const currency = useCurrency(); // Get current currency
  const toast = useToast();

  // Get currency symbol based on selected currency
  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'PKR': 'Rs',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency as string] || '$';
  };

  const currencySymbol = getCurrencySymbol();

  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/admin');
    }
  }, [user, router]);

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [settings, setSettings] = useState({
    // Store Information
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',

    // Business Configuration
    currency: 'USD',
    baseCurrency: 'PKR',
    usdToPkrRate: '279.89',
    timezone: 'Asia/Karachi',
    language: 'en',

    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    customerSignups: false,
    marketingEmails: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',

    // Appearance Settings (from context, not DB)
    darkMode: false,
    compactView: false,
    sidebarCollapsed: false,

    // Payment Settings
    stripeEnabled: true,
    paypalEnabled: true,
    codEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    taxRate: '10',
    includeTaxInPrices: false,

    // Shipping Settings
    freeShippingThreshold: '50',
    standardShippingCost: '5.99',
    expressShippingCost: '12.99',
    standardDeliveryDays: '5-7',
    expressDeliveryDays: '2-3',
    expressShippingEnabled: true,
    internationalShippingEnabled: false,

    // Advanced Settings
    maintenanceMode: false,
    debugMode: false,
    apiRateLimit: '100',
    cacheDuration: '3600',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch settings');
        return;
      }

      const data = await response.json();
      if (data.success && data.data.settings) {
        const dbSettings = data.data.settings;
        setSettings(prev => ({
          ...prev,
          // Store Information
          storeName: dbSettings.storeName || 'LuxeStore',
          storeEmail: dbSettings.storeEmail || 'admin@luxestore.com',
          storePhone: dbSettings.storePhone || '',
          storeAddress: dbSettings.storeAddress || '',

          // Business Configuration
          currency: dbSettings.currency || 'USD',
          baseCurrency: dbSettings.baseCurrency || 'PKR',
          usdToPkrRate: dbSettings.usdToPkrRate?.toString() || '279.89',
          timezone: dbSettings.timezone || 'Asia/Karachi',
          language: dbSettings.language || 'en',

          // Notification Settings
          emailNotifications: dbSettings.emailNotifications ?? true,
          orderNotifications: dbSettings.orderNotifications ?? true,
          lowStockAlerts: dbSettings.lowStockAlerts ?? true,
          customerSignups: dbSettings.customerSignups ?? false,
          marketingEmails: dbSettings.marketingEmails ?? true,

          // Security Settings
          sessionTimeout: dbSettings.sessionTimeout?.toString() || '30',
          passwordExpiry: dbSettings.passwordExpiryDays?.toString() || '90',
          twoFactorAuth: user?.twoFactorEnabled || false,

          // Payment Settings
          stripeEnabled: dbSettings.stripeEnabled ?? true,
          paypalEnabled: dbSettings.paypalEnabled ?? true,
          codEnabled: dbSettings.codEnabled ?? false,
          stripePublishableKey: dbSettings.stripePublishableKey || '',
          paypalClientId: dbSettings.paypalClientId || '',
          taxRate: dbSettings.taxRate?.toString() || '10',
          includeTaxInPrices: dbSettings.includeTaxInPrices ?? false,

          // Shipping Settings
          freeShippingThreshold: dbSettings.freeShippingThreshold?.toString() || '50',
          standardShippingCost: dbSettings.standardShippingCost?.toString() || '5.99',
          expressShippingCost: dbSettings.expressShippingCost?.toString() || '12.99',
          standardDeliveryDays: dbSettings.standardDeliveryDays || '5-7',
          expressDeliveryDays: dbSettings.expressDeliveryDays || '2-3',
          expressShippingEnabled: dbSettings.expressShippingEnabled ?? true,
          internationalShippingEnabled: dbSettings.internationalShippingEnabled ?? false,

          // Advanced Settings
          maintenanceMode: dbSettings.maintenanceMode ?? false,
          debugMode: dbSettings.debugMode ?? false,
          apiRateLimit: dbSettings.apiRateLimit?.toString() || '100',
          cacheDuration: dbSettings.cacheDuration?.toString() || '3600',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'advanced', name: 'Advanced', icon: Database },
  ];

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          // Store Information
          storeName: settings.storeName,
          storeEmail: settings.storeEmail,
          storePhone: settings.storePhone,
          storeAddress: settings.storeAddress,

          // Business Configuration
          currency: settings.currency,
          baseCurrency: settings.baseCurrency,
          usdToPkrRate: parseFloat(settings.usdToPkrRate),
          timezone: settings.timezone,
          language: settings.language,

          // Notification Settings
          emailNotifications: settings.emailNotifications,
          orderNotifications: settings.orderNotifications,
          lowStockAlerts: settings.lowStockAlerts,
          customerSignups: settings.customerSignups,
          marketingEmails: settings.marketingEmails,

          // Security Settings
          sessionTimeout: parseInt(settings.sessionTimeout),
          passwordExpiryDays: parseInt(settings.passwordExpiry),

          // Payment Settings
          stripeEnabled: settings.stripeEnabled,
          paypalEnabled: settings.paypalEnabled,
          codEnabled: settings.codEnabled,
          stripePublishableKey: settings.stripePublishableKey,
          stripeSecretKey: settings.stripeSecretKey,
          paypalClientId: settings.paypalClientId,
          taxRate: parseFloat(settings.taxRate),
          includeTaxInPrices: settings.includeTaxInPrices,

          // Shipping Settings
          freeShippingThreshold: parseFloat(settings.freeShippingThreshold),
          standardShippingCost: parseFloat(settings.standardShippingCost),
          expressShippingCost: parseFloat(settings.expressShippingCost),
          standardDeliveryDays: settings.standardDeliveryDays,
          expressDeliveryDays: settings.expressDeliveryDays,
          expressShippingEnabled: settings.expressShippingEnabled,
          internationalShippingEnabled: settings.internationalShippingEnabled,

          // Advanced Settings
          maintenanceMode: settings.maintenanceMode,
          debugMode: settings.debugMode,
          apiRateLimit: parseInt(settings.apiRateLimit),
          cacheDuration: parseInt(settings.cacheDuration),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Refresh the settings context to update currency across the app
      await refreshSettings();

      toast.success('Success', 'Settings saved successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/2fa/enable`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setShow2FAModal(true);
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setBackupCodes(data.data.backupCodes);
      setShowBackupCodes(true);
      setSettings(prev => ({ ...prev, twoFactorAuth: true }));
      toast.success('Success', '2FA enabled successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSettings(prev => ({ ...prev, twoFactorAuth: false }));
      toast.success('Success', '2FA disabled successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/settings/clear-cache`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success('Success', 'Cache cleared successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Copied', 'Secret key copied to clipboard');
  };

  const close2FAModal = () => {
    setShow2FAModal(false);
    setShowBackupCodes(false);
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your store settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Security Settings
                </h2>

                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">
                        💡 Need to Change Your Password?
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-400">
                        Visit <a href="/admin/account" className="font-semibold underline hover:text-purple-600 dark:hover:text-purple-300">Account Settings</a> to change your personal password and manage your profile.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleEnable2FA();
                            } else {
                              handleDisable2FA();
                            }
                          }}
                          disabled={isLoading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <CustomDropdown
                    label="Session Timeout"
                    value={settings.sessionTimeout}
                    onChange={(value) => setSettings({ ...settings, sessionTimeout: value })}
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: '120', label: '2 hours' },
                    ]}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Automatically log out inactive users after this duration
                  </p>

                  <CustomDropdown
                    label="Password Expiry"
                    value={settings.passwordExpiry}
                    onChange={(value) => setSettings({ ...settings, passwordExpiry: value })}
                    options={[
                      { value: '30', label: '30 days' },
                      { value: '60', label: '60 days' },
                      { value: '90', label: '90 days' },
                      { value: '180', label: '180 days' },
                      { value: 'never', label: 'Never expire' },
                    ]}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Require users to change passwords after this period
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                General Settings
              </h2>

              <div className="space-y-6">
                {/* Store Information */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Store Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Email
                      </label>
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Address
                      </label>
                      <textarea
                        value={settings.storeAddress}
                        onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Street, City, State, ZIP Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Configuration */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Business Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <CustomDropdown
                        value={settings.currency}
                        onChange={(value) => setSettings({ ...settings, currency: value })}
                        options={[
                          { value: 'USD', label: 'USD - US Dollar' },
                          { value: 'PKR', label: 'PKR - Pakistani Rupee' },
                        ]}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Display currency for prices (all prices stored in PKR)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        USD to PKR Exchange Rate
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={settings.usdToPkrRate}
                        onChange={(e) => setSettings({ ...settings, usdToPkrRate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="279.89"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        1 USD = {settings.usdToPkrRate || '279.89'} PKR (used for currency conversion)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <CustomDropdown
                        value={settings.timezone}
                        onChange={(value) => setSettings({ ...settings, timezone: value })}
                        options={[
                          { value: 'America/New_York', label: 'Eastern Time (ET)' },
                          { value: 'America/Chicago', label: 'Central Time (CT)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                          { value: 'Europe/London', label: 'London (GMT)' },
                          { value: 'Asia/Karachi', label: 'Pakistan (PKT)' },
                          { value: 'Asia/Dubai', label: 'Dubai (GST)' },
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <CustomDropdown
                        value={settings.language}
                        onChange={(value) => setSettings({ ...settings, language: value })}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'ur', label: 'Urdu' },
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Settings
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications for important events' },
                  { key: 'orderNotifications', label: 'Order Notifications', desc: 'Get notified when new orders are placed' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alert when products are running low' },
                  { key: 'customerSignups', label: 'Customer Signups', desc: 'Notify when new customers register' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Send promotional and marketing emails to customers' },
                ].map((item) => (
                  <div key={item.key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Settings
              </h2>

              {/* Payment Methods */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Payment Methods</h3>
                <div className="space-y-4">
                  {[
                    { key: 'stripeEnabled', label: 'Stripe', desc: 'Accept credit card payments via Stripe' },
                    { key: 'codEnabled', label: 'Cash on Delivery', desc: 'Allow cash on delivery option' },
                  ].map((item) => (
                    <div key={item.key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[item.key as keyof typeof settings] as boolean}
                            onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Keys */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stripe Publishable Key
                    </label>
                    <input
                      type="text"
                      value={settings.stripePublishableKey}
                      onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                      placeholder="pk_test_..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                      placeholder="sk_test_..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Settings */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Tax Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Include Tax in Prices</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Display prices with tax included</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.includeTaxInPrices}
                          onChange={(e) => setSettings({ ...settings, includeTaxInPrices: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Settings
              </h2>

              {/* Shipping Costs */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Shipping Costs</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Free Shipping Threshold ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders above this amount get free shipping</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Standard Shipping Cost ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settings.standardShippingCost}
                      onChange={(e) => setSettings({ ...settings, standardShippingCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Express Shipping Cost ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settings.expressShippingCost}
                      onChange={(e) => setSettings({ ...settings, expressShippingCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Delivery Time Estimates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Standard Delivery (days)
                    </label>
                    <input
                      type="text"
                      value={settings.standardDeliveryDays}
                      onChange={(e) => setSettings({ ...settings, standardDeliveryDays: e.target.value })}
                      placeholder="e.g., 5-7"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Express Delivery (days)
                    </label>
                    <input
                      type="text"
                      value={settings.expressDeliveryDays}
                      onChange={(e) => setSettings({ ...settings, expressDeliveryDays: e.target.value })}
                      placeholder="e.g., 2-3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Shipping Options</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Express Shipping</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Offer faster delivery option</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.expressShippingEnabled}
                          onChange={(e) => setSettings({ ...settings, expressShippingEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">International Shipping</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ship to international addresses</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.internationalShippingEnabled}
                          onChange={(e) => setSettings({ ...settings, internationalShippingEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance Settings
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enable dark theme across the admin panel</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Compact View</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reduce spacing for a more condensed layout</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompactView}
                        onChange={toggleCompactView}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Palette className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Collapsed Sidebar</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Show icons only in the sidebar</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSidebarCollapsed}
                        onChange={toggleSidebarCollapsed}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Advanced Settings
              </h2>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                      ⚠️ Caution Required
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Advanced settings are for experienced users only. Changing these settings may affect your store's functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Temporarily disable the store for maintenance
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Debug Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Enable detailed error logging
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.debugMode}
                        onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                    min="10"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum API requests allowed per minute per user
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cache Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.cacheDuration}
                    onChange={(e) => setSettings({ ...settings, cacheDuration: e.target.value })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    How long to cache data before refreshing
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleClearCache}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Clearing...' : 'Clear All Cache'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showBackupCodes ? 'Backup Codes' : 'Enable Two-Factor Authentication'}
              </h3>
              <button onClick={close2FAModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showBackupCodes ? (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {qrCode && <QRCodeSVG value={qrCode} size={200} />}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key (Manual Entry)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={secret}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    />
                    <button
                      onClick={copySecret}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {copiedCode ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleVerify2FA}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Save these backup codes in a safe place. Each code can only be used once.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-center">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  onClick={close2FAModal}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
