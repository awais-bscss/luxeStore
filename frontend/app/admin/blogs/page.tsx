'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search, X, Loader2,
  Calendar, User, Tag, FileText, Upload
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from '@/hooks/useRedux';
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  uploadBlogImage,
  Blog,
  BlogFormData,
} from '@/store/slices/blogSlice';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// ─── Default form state ───────────────────────────────────────────────────────
const emptyForm: BlogFormData = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  featuredImage: '',
  isPublished: false,
};

export default function AdminBlogsPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { blogs, isLoading, isSubmitting } = useSelector((state: RootState) => state.blogs);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(emptyForm);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; blogId: string | null }>({
    open: false,
    blogId: null,
  });

  // ─── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  // ─── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const anyOpen = showModal || deleteModal.open;
    if (!anyOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [showModal, deleteModal.open]);

  // ─── Modal helpers ──────────────────────────────────────────────────────────
  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags.join(', '),
        featuredImage: blog.featuredImage || '',
        isPublished: blog.isPublished,
      });
    } else {
      setEditingBlog(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setFormData(emptyForm);
  };

  // ─── Submit (create / update) ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      const result = await dispatch(updateBlog({ id: editingBlog._id, formData }));
      if (updateBlog.fulfilled.match(result)) {
        toast.success('Success', 'Blog updated successfully');
        handleCloseModal();
      } else {
        toast.error('Error', (result.payload as string) || 'Failed to update blog');
      }
    } else {
      const result = await dispatch(createBlog(formData));
      if (createBlog.fulfilled.match(result)) {
        toast.success('Success', 'Blog created successfully');
        handleCloseModal();
      } else {
        toast.error('Error', (result.payload as string) || 'Failed to create blog');
      }
    }
  };

  // ─── Toggle publish ──────────────────────────────────────────────────────────
  const handleToggleStatus = async (blogId: string) => {
    const result = await dispatch(toggleBlogStatus(blogId));
    if (toggleBlogStatus.fulfilled.match(result)) {
      toast.success('Success', result.payload.isPublished ? 'Blog published' : 'Blog unpublished');
    } else {
      toast.error('Error', (result.payload as string) || 'Failed to toggle status');
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (blogId: string) => {
    setDeleteModal({ open: true, blogId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.blogId) return;
    const result = await dispatch(deleteBlog(deleteModal.blogId));
    if (deleteBlog.fulfilled.match(result)) {
      toast.success('Success', 'Blog deleted successfully');
    } else {
      toast.error('Error', (result.payload as string) || 'Failed to delete blog');
    }
  };

  // ─── Image upload ────────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Error', 'Image size must be less than 5MB');
      return;
    }
    setIsUploadingImage(true);
    const result = await dispatch(uploadBlogImage(file));
    setIsUploadingImage(false);
    if (uploadBlogImage.fulfilled.match(result)) {
      setFormData((prev) => ({ ...prev, featuredImage: result.payload }));
      toast.success('Success', 'Image uploaded successfully');
    } else {
      toast.error('Error', (result.payload as string) || 'Failed to upload image');
    }
    e.target.value = '';
  };

  // ─── Filtered list ───────────────────────────────────────────────────────────
  const filteredBlogs = blogs.filter((blog) => {
    const q = searchQuery.toLowerCase();
    return (
      blog.title.toLowerCase().includes(q) ||
      blog.excerpt.toLowerCase().includes(q) ||
      blog.category.toLowerCase().includes(q) ||
      blog.author.name.toLowerCase().includes(q) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, blogId: null })}
        onConfirm={confirmDelete}
        type="danger"
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Blog Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage blog posts
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Blog Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Blogs</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{blogs.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Published</div>
          <div className="text-2xl font-bold text-green-600">{blogs.filter((b) => b.isPublished).length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">{blogs.filter((b) => !b.isPublished).length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Views</div>
          <div className="text-2xl font-bold text-blue-600">{blogs.reduce((sum, b) => sum + b.views, 0)}</div>
        </div>
      </div>

      {/* Blogs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Blogs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first blog post'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Blog
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {blog.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${blog.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {blog.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {blog.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {blog.views} views
                    </span>
                  </div>

                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(blog._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {blog.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(blog)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter blog title"
                />
              </div>

              {/* Category & Tags */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Technology, Fashion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., tech, innovation, tips"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt * (max 300 characters)
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={300}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Brief summary of the blog post"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.excerpt.length}/300 characters
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Image
                </label>
                {formData.featuredImage && (
                  <div className="relative mb-3">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="blog-image-upload"
                  />
                  <label
                    htmlFor="blog-image-upload"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {isUploadingImage ? 'Uploading...' : formData.featuredImage ? 'Change Image' : 'Upload Image'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recommended: 1200x630px, Max 5MB
                </p>
              </div>

              {/* Publish Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Publish immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingBlog ? 'Update Blog' : 'Create Blog'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
