'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomDropdown from '../../../components/ui/CustomDropdown';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  X,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../hooks/useToast';
import { formatPrice } from '../../../lib/currency';
import { useSettings } from '../../../contexts/SettingsContext';
import { useAppSelector } from '../../../hooks/useRedux';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  specifications: { key: string; value: string }[];
  isActive: boolean;
  isFeatured: boolean;
  discount?: number;
  rating: number;
  reviewCount: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { token } = useAppSelector((state) => state.auth);
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null,
  });
  const [viewModal, setViewModal] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 900);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setShowActions(null);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  useEffect(() => {
    fetchProducts();
  }, [token, pagination.page, selectedCategory, selectedStatus, debouncedSearch]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus === 'active') params.append('isActive', 'true');
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`${API_URL}/products?${params}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
    if (product.stock === 0) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
    if (product.stock < 10) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getStatusText = (product: Product) => {
    if (!product.isActive) return 'Inactive';
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock < 10) return 'Low Stock';
    return 'Active';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewProduct = (product: Product) => {
    setViewModal({ show: true, product });
    setShowActions(null);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteModal({ show: true, product });
    setShowActions(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_URL}/products/${deleteModal.product._id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product Deleted', 'Product has been successfully deleted');
        setDeleteModal({ show: false, product: null });
        fetchProducts();
      } else {
        toast.error('Delete Failed', data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete Failed', 'An error occurred while deleting the product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      setIsDuplicating(true);
      setShowActions(null);

      // Generate new SKU
      const timestamp = Date.now();
      const newSKU = `${product.sku}-COPY-${timestamp}`;

      // Create duplicate product data
      const duplicateData = {
        name: `${product.name} (Copy)`,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        sku: newSKU,
        thumbnail: product.thumbnail,
        images: product.images,
        tags: product.tags,
        specifications: product.specifications,
        isActive: false, // Set to inactive by default
        isFeatured: false,
        discount: product.discount,
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(duplicateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product Duplicated', 'Product has been successfully duplicated');
        fetchProducts();
      } else {
        toast.error('Duplication Failed', data.message || 'Failed to duplicate product');
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Duplication Failed', 'An error occurred while duplicating the product');
    } finally {
      setIsDuplicating(false);
    }
  };

  const filteredProducts = products;

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6 relative">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden rounded-t-xl">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-loading-bar w-full" />
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Link href="/admin/products/add" className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Link>
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <CustomDropdown
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categories.map(cat => ({
              value: cat,
              label: cat === 'all' ? 'All Categories' : cat
            }))}
          />

          {/* Status Filter */}
          <CustomDropdown
            value={selectedStatus}
            onChange={handleStatusChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ]}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-full" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">No products found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {debouncedSearch || selectedCategory !== 'all' || selectedStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first product'}
                        </p>
                      </div>
                      {!debouncedSearch && selectedCategory === 'all' && selectedStatus === 'all' && (
                        <Link
                          href="/admin/products/add"
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Product
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPrice(product.price, settings.currency, settings.usdToPkrRate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.stock} units
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getStockStatus(product.stock)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          product
                        )}`}
                      >
                        {getStatusText(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.createdBy?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.createdBy?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative inline-block action-menu-container">
                        <button
                          onClick={() =>
                            setShowActions(
                              showActions === product._id ? null : product._id
                            )
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        {showActions === product._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(product)}
                              disabled={isDuplicating}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Copy className="h-4 w-4" />
                              <span>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`px-3 py-1 rounded-lg text-sm ${pagination.page === page
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      {viewModal.show && viewModal.product && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h2>
              <button
                onClick={() => setViewModal({ show: false, product: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {viewModal.product.thumbnail ? (
                    <Image
                      src={viewModal.product.thumbnail}
                      alt={viewModal.product.name}
                      width={192}
                      height={192}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">{viewModal.product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-mono">{viewModal.product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{viewModal.product.category}</p>
                </div>
                {viewModal.product.subcategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{viewModal.product.subcategory}</p>
                  </div>
                )}
                {viewModal.product.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{viewModal.product.brand}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-semibold">{formatPrice(viewModal.product.price, settings.currency, settings.usdToPkrRate)}</p>
                </div>
                {viewModal.product.comparePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Compare Price</label>
                    <p className="mt-1 text-gray-900 dark:text-white line-through">{formatPrice(viewModal.product.comparePrice, settings.currency, settings.usdToPkrRate)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{viewModal.product.stock} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(viewModal.product)}`}>
                      {getStatusText(viewModal.product)}
                    </span>
                  </p>
                </div>
                {viewModal.product.rating > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {viewModal.product.rating.toFixed(1)} ⭐ ({viewModal.product.reviewCount} reviews)
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{viewModal.product.description}</p>
              </div>

              {/* Tags */}
              {viewModal.product.tags && viewModal.product.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewModal.product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {viewModal.product.specifications && viewModal.product.specifications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Specifications</label>
                  <div className="mt-2 space-y-2">
                    {viewModal.product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{spec.key}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created By */}
              {viewModal.product.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {viewModal.product.createdBy.name} ({viewModal.product.createdBy.email})
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewModal({ show: false, product: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewModal({ show: false, product: null });
                  handleEditProduct(viewModal.product!._id);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.product && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
                Delete Product
              </h3>
              <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.product.name}</span>? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, product: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

