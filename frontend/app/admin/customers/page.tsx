'use client';

import { useState, useEffect } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  UserCheck,
} from 'lucide-react';
import { Customer } from '@/types/customer';
import { exportToExcel, formatDateForExport } from '@/utils/exportData';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { formatPrice } from '@/lib/currency';
import { useSettings } from '@/contexts/SettingsContext';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function CustomersPage() {
  const state = useAppSelector((state) => state);
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { user, token } = state.auth;
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showActions, setShowActions] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'vip' | 'blocked',
  });
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: '',
    attachments: [] as File[],
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch customers from API
  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching customers from API...');
        const data = await apiClient('/users/customers', {}, dispatch, state);
        console.log('API Response:', data);

        if (data.success && isMounted) {
          const fetchedCustomers = (data as any).customers || data.data?.customers;
          console.log('Customers data:', fetchedCustomers);
          setCustomers(fetchedCustomers || []);
        } else {
          console.error('API returned success=false or no data:', data);
          throw new Error(data.message || 'Failed to fetch customers');
        }
      } catch (err: any) {
        console.error('Error in fetchCustomers:', err);
        if (err.code === 'SESSION_EXPIRED') {
          toast.error('Session Expired', err.message);
          router.push('/login?redirect=/admin/customers&reason=session_expired');
        } else {
          console.error('Error fetching customers:', err);
          if (isMounted) setError(err.message || 'Failed to load customers');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCustomers();
    return () => { isMounted = false; };
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-dropdown')) {
        setShowActions(null);
      }
    };

    if (showActions !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  // Lock scroll when modals are open
  useEffect(() => {
    if (showViewModal || showEditModal || showBlockModal || showEmailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showViewModal, showEditModal, showBlockModal, showEmailModal]);

  // Handler functions
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setShowActions(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      location: customer.location || '',
      status: customer.status || 'active',
    });
    setShowEditModal(true);
    setShowActions(null);
  };

  const handleBlockCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowBlockModal(true);
    setShowActions(null);
  };

  const handleSendEmail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEmailModal(true);
    setShowActions(null);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const data = await apiClient(`/customers/${selectedCustomer._id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      }, dispatch, state);

      if (data.success) {
        // Update local state
        setCustomers(customers.map(c =>
          c._id === selectedCustomer._id
            ? { ...c, ...editFormData }
            : c
        ));
        setShowEditModal(false);
        setSelectedCustomer(null);
        toast.success('Customer Updated', 'The customer information has been successfully updated.');
      } else {
        toast.error('Update Failed', data.message || 'Failed to update customer');
      }
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast.error('Update Error', 'An error occurred while updating the customer');
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedCustomer) return;

    const newStatus = (selectedCustomer.status || 'active') === 'blocked' ? 'active' : 'blocked';

    try {
      const data = await apiClient(`/customers/${selectedCustomer._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      }, dispatch, state);

      if (data.success) {
        // Update local state
        setCustomers(customers.map(c =>
          c._id === selectedCustomer._id
            ? { ...c, status: newStatus }
            : c
        ));
        setShowBlockModal(false);
        setSelectedCustomer(null);
        toast.success('Status Updated', `Customer status changed to ${newStatus}`);
      } else {
        toast.error('Update Failed', data.message || 'Failed to update customer status');
      }
    } catch (err: any) {
      console.error('Error updating customer status:', err);
      toast.error('Update Error', 'An error occurred while updating the customer status');
    }
  };

  const handleSendEmailSubmit = async () => {
    if (!selectedCustomer) return;
    if (!emailFormData.subject || !emailFormData.message) {
      toast.error('Missing Information', 'Please fill in both subject and message');
      return;
    }

    setIsSendingEmail(true);
    try {
      const formData = new FormData();
      formData.append('to', selectedCustomer.email);
      formData.append('subject', emailFormData.subject);
      formData.append('message', emailFormData.message);

      // Append all attachments
      emailFormData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const data = await apiClient('/email/send', {
        method: 'POST',
        body: formData,
      }, dispatch, state);

      if (data.success) {
        toast.success('Email Sent', 'The email has been successfully sent to the customer.');
        setShowEmailModal(false);
        setEmailFormData({ subject: '', message: '', attachments: [] });
      } else {
        toast.error('Send Failed', data.message || 'Failed to send email');
      }
    } catch (err: any) {
      console.error('Error sending email:', err);
      toast.error('Send Error', 'An error occurred while sending the email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'vip':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchQuery));
      const matchesStatus =
        selectedStatus === 'all' || customer.status === selectedStatus || (!customer.status && selectedStatus === 'all');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Handle null lastOrder dates
          if (!a.lastOrder && !b.lastOrder) return 0;
          if (!a.lastOrder) return 1;
          if (!b.lastOrder) return -1;
          return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Export customers to Excel with professional formatting
  const handleExportCustomers = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Customer ID': customer._id,
      'Name': customer.name,
      'Email': customer.email,
      'Email Verified': customer.isEmailVerified ? 'Yes' : 'No',
      'Phone': customer.phone || 'N/A',
      'Location': customer.location || 'N/A',
      'Status': (customer.status || 'inactive').toUpperCase(),
      'Total Orders': customer.totalOrders,
      'Total Spent': formatPrice(customer.totalSpent, settings.currency, settings.usdToPkrRate),
      'Average Order Value': customer.totalOrders > 0
        ? formatPrice(customer.totalSpent / customer.totalOrders, settings.currency, settings.usdToPkrRate)
        : formatPrice(0, settings.currency, settings.usdToPkrRate),
      'Join Date': formatDateForExport(customer.joinDate),
      'Last Order Date': customer.lastOrder ? formatDateForExport(customer.lastOrder) : 'Never',
      'Account Age (Days)': Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24))
    }));

    const timestamp = new Date().toISOString().split('T')[0];

    exportToExcel(exportData, {
      filename: `LuxeStore-Customers-${timestamp}`,
      sheetName: 'Customers',
      title: '=== LUXESTORE CUSTOMER REPORT ===',
      subtitle: 'Complete Customer Database Export',
      exportedBy: user?.name || 'Admin',
      additionalInfo: {
        'Total Customers': filteredCustomers.length.toString(),
        'Active Customers': stats.active.toString(),
        'VIP Customers': stats.vip.toString(),
        'Blocked Customers': stats.blocked.toString(),
        'Total Revenue': formatPrice(stats.totalRevenue, settings.currency, settings.usdToPkrRate),
        'Average Order Value': formatPrice(stats.avgOrderValue, settings.currency, settings.usdToPkrRate),
        'Currency': settings.currency,
        'Filter Applied': selectedStatus === 'all' ? 'None' : selectedStatus.toUpperCase(),
        'Sort By': sortBy === 'recent' ? 'Recent Activity' : sortBy === 'orders' ? 'Most Orders' : sortBy === 'spent' ? 'Highest Spent' : 'Name (A-Z)'
      }
    });
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    vip: customers.filter((c) => c.status === 'vip').length,
    inactive: customers.filter((c) => c.status === 'inactive').length,
    blocked: customers.filter((c) => c.status === 'blocked').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: (() => {
      const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
      const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      return totalOrders > 0 ? totalSpent / totalOrders : 0;
    })(),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer base and relationships
          </p>
        </div>
        <button
          onClick={handleExportCustomers}
          className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Customers
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatPrice(stats.totalRevenue, settings.currency, settings.usdToPkrRate)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg Order Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatPrice(stats.avgOrderValue, settings.currency, settings.usdToPkrRate)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <CustomDropdown
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'vip', label: 'VIP' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'blocked', label: 'Blocked' },
            ]}
          />

          {/* Sort By */}
          <CustomDropdown
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            options={[
              { value: 'recent', label: 'Recent Activity' },
              { value: 'orders', label: 'Most Orders' },
              { value: 'spent', label: 'Highest Spent' },
              { value: 'name', label: 'Name (A-Z)' },
            ]}
          />
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="col-span-full text-center py-20">
          <p className="text-xl text-red-500 font-medium mb-2">Error loading customers</p>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <p className="text-xl text-gray-400 font-medium">No customers found</p>
          <p className="text-sm text-gray-500 mt-2">Customers will appear here once they register</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => {
            // Generate avatar initials from name
            const getInitials = (name: string) => {
              return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            };

            // Format date
            const formatDate = (dateString: string | null) => {
              if (!dateString) return 'N/A';
              return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            };

            return (
              <div
                key={customer._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {customer.profileImage ? (
                      <img
                        src={customer.profileImage}
                        alt={customer.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-full ${getAvatarColor(
                          index
                        )} flex items-center justify-center text-white font-semibold`}
                      >
                        {getInitials(customer.name)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {customer.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getStatusColor(
                          customer.status || 'inactive'
                        )}`}
                      >
                        {(customer.status || 'inactive').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="relative action-dropdown">
                    <button
                      onClick={() =>
                        setShowActions(showActions === index ? null : index)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {showActions === index && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleSendEmail(customer)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Send Email</span>
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleBlockCustomer(customer)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Ban className="h-4 w-4" />
                          <span>{(customer.status || 'active') === 'blocked' ? 'Unblock' : 'Block'} Customer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.location}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Orders
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {customer.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Spent
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {formatPrice(customer.totalSpent, settings.currency, settings.usdToPkrRate)}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {formatDate(customer.joinDate)}</span>
                  </div>
                  <div>Last order: {formatDate(customer.lastOrder)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Next
          </button>
        </div>
      </div>

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowViewModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4">
                  {selectedCustomer.profileImage ? (
                    <img
                      src={selectedCustomer.profileImage}
                      alt={selectedCustomer.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                      {selectedCustomer.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedCustomer.name}
                    </h3>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${getStatusColor(selectedCustomer.status || 'inactive')}`}>
                      {(selectedCustomer.status || 'inactive').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCustomer.email}</p>
                  </div>
                  {selectedCustomer.phone && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                    </div>
                  )}
                  {selectedCustomer.location && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Location
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedCustomer.location}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Email Verified
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedCustomer.isEmailVerified ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatPrice(selectedCustomer.totalSpent, settings.currency, settings.usdToPkrRate)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Order</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.lastOrder ? new Date(selectedCustomer.lastOrder).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditCustomer(selectedCustomer);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Edit Customer
                  </button>
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors text-center"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Customer
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email 🔒
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    readOnly
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <CustomDropdown
                    value={editFormData.status}
                    onChange={(value) => setEditFormData({ ...editFormData, status: value as any })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'vip', label: 'VIP' },
                      { value: 'blocked', label: 'Blocked' },
                    ]}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Block/Unblock Confirmation Modal */}
      {showBlockModal && selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowBlockModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-full ${selectedCustomer.status === 'blocked' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <Ban className={`w-6 h-6 ${selectedCustomer.status === 'blocked' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCustomer.status === 'blocked' ? 'Unblock' : 'Block'} Customer?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCustomer.status === 'blocked'
                      ? `Are you sure you want to unblock ${selectedCustomer.name}? They will be able to place orders again.`
                      : `Are you sure you want to block ${selectedCustomer.name}? They won't be able to place orders.`
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleBlock}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${selectedCustomer.status === 'blocked'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                  {selectedCustomer.status === 'blocked' ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Send Email Modal */}
      {showEmailModal && selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowEmailModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Send Email
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    To: {selectedCustomer.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={emailFormData.subject}
                    onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={emailFormData.message}
                    onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your message here..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Attachments (PDF, Images, Excel, ZIP)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv,.zip"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setEmailFormData({ ...emailFormData, attachments: files });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-400"
                  />
                  {emailFormData.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {emailFormData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={isSendingEmail}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmailSubmit}
                    disabled={isSendingEmail}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

