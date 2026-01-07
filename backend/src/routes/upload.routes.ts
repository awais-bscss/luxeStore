import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload.middleware';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  uploadBlogImage,
} from '../controllers/upload.controller';

const router = Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image
 * @access  Admin, SuperAdmin
 */
router.post('/image', upload.single('image'), uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images
 * @access  Admin, SuperAdmin
 */
router.post('/images', upload.array('images', 10), uploadMultipleImages);

/**
 * @route   POST /api/upload/blog-image
 * @desc    Upload blog featured image
 * @access  Admin, SuperAdmin
 */
router.post('/blog-image', upload.single('image'), uploadBlogImage);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete an image from Cloudinary
 * @access  Admin, SuperAdmin
 */
router.delete('/image', deleteImage);

export default router;
