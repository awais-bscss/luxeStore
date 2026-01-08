"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useRouter } from "next/navigation";
import { Mail, Clock, CheckCircle, Trash2, Eye, Filter } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactMessagesPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'replied' | 'resolved'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`${API_URL}/contact?${params}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        setPagination({
          ...pagination,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages,
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin')) {
      fetchMessages();
    }
  }, [selectedStatus, pagination.page, isAuthenticated, user]);

  // Update message status
  const updateStatus = async (messageId: string, newStatus: 'pending' | 'replied' | 'resolved') => {
    try {
      const response = await fetch(`${API_URL}/contact/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchMessages();
        if (selectedMessage?._id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Delete message
  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      const response = await fetch(`${API_URL}/contact/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        fetchMessages();
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setMessageToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'replied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'replied': return <Mail className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };



  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Contact Messages
          </h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage customer inquiries and support requests
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
          {['all', 'pending', 'replied', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status as any);
                setPagination({ ...pagination, page: 1 });
              }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${selectedStatus === status
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loader for Messages
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`p-4 sm:p-6 rounded-xl border animate-pulse ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-5 w-20 bg-gray-100 dark:bg-gray-900/30 rounded-full" />
                    </div>
                    <div className="h-4 w-64 bg-gray-100 dark:bg-gray-700 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-50 dark:bg-gray-900/10 rounded" />
                      <div className="h-4 w-2/3 bg-gray-50 dark:bg-gray-900/10 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Mail className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No messages found
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className={`text-base sm:text-lg font-bold truncate max-w-[200px] sm:max-w-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {message.subject}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        {message.status.toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-semibold">From:</span> {message.name} <span className="hidden sm:inline">({message.email})</span>
                    </div>
                    <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {message.message}
                    </p>
                    <p className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex md:flex-col lg:flex-row gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 sm:flex-none p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="md:hidden lg:inline text-xs font-medium">View</span>
                    </button>

                    {message.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(message._id, message.status === 'pending' ? 'replied' : 'resolved')}
                        className="flex-1 sm:flex-none p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                        title={message.status === 'pending' ? 'Mark as Replied' : 'Mark as Resolved'}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="md:hidden lg:inline text-xs font-medium">
                          {message.status === 'pending' ? 'Reply' : 'Resolve'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClick(message._id)}
                      className="flex-1 sm:flex-none p-2 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden lg:inline text-xs font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && messages.length > 0 && pagination.pages > 1 && (
          <div className={`rounded-xl border p-4 mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing page <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pagination.page}</span> of{' '}
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pagination.pages}</span>
                {' '}({pagination.total} total messages)
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.page === 1
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination({ ...pagination, page: pageNum })}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${pagination.page === pageNum
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.page === pagination.pages
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl z-[60]">
            <div className={`rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-start justify-between mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Message Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`text-2xl p-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Subject
                  </label>
                  <p className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    From
                  </label>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <span className="font-semibold">{selectedMessage.name}</span>
                    <br />
                    <span className="text-blue-500">{selectedMessage.email}</span>
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Message
                  </label>
                  <div className={`text-sm sm:text-base whitespace-pre-wrap p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Received
                    </label>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all text-center text-sm shadow-lg shadow-blue-500/20"
                  >
                    Reply via Email
                  </a>
                  {selectedMessage.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedMessage._id, selectedMessage.status === 'pending' ? 'replied' : 'resolved');
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-green-500/20"
                    >
                      Mark as {selectedMessage.status === 'pending' ? 'Replied' : 'Resolved'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={cancelDelete}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-[60]">
            <div className={`rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Delete Message?
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Are you sure you want to delete this contact message? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
