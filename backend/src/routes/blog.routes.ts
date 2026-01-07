import express from 'express';
import {
  getPublishedBlogs,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} from '../controllers/blog.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/published', getPublishedBlogs);
router.get('/slug/:slug', getBlogBySlug);

// Admin/Superadmin routes
router.get('/', protect, authorize('admin', 'superadmin'), getAllBlogs);
router.get('/:id', protect, authorize('admin', 'superadmin'), getBlogById);
router.post('/', protect, authorize('admin', 'superadmin'), createBlog);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateBlog);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBlog);
router.patch('/:id/toggle-status', protect, authorize('admin', 'superadmin'), toggleBlogStatus);

export default router;
