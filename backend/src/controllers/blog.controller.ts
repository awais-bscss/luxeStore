import { Response } from 'express';
import Blog from '../models/Blog.model';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/errors';

/**
 * Get all published blogs (public)
 */
export const getPublishedBlogs = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const blogs = await Blog.find({ isPublished: true })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 });

  res.status(200).json({
    success: true,
    data: { blogs },
  });
});

/**
 * Get all blogs (admin/superadmin only)
 */
export const getAllBlogs = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const blogs = await Blog.find()
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { blogs },
  });
});

/**
 * Get single blog by slug (public)
 */
export const getBlogBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, isPublished: true })
    .populate('author', 'name email');

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: { blog },
  });
});

/**
 * Get single blog by ID (admin)
 */
export const getBlogById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findById(id).populate('author', 'name email');

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  res.status(200).json({
    success: true,
    data: { blog },
  });
});

/**
 * Create new blog (admin/superadmin)
 */
export const createBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, excerpt, content, category, tags, featuredImage, isPublished } = req.body;

  if (!title || !excerpt || !content || !category) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
    return;
  }

  // Create slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if slug already exists
  const existingBlog = await Blog.findOne({ slug });
  if (existingBlog) {
    res.status(400).json({
      success: false,
      message: 'A blog with this title already exists',
    });
    return;
  }

  const blog = await Blog.create({
    title,
    slug,
    excerpt,
    content,
    category,
    tags: tags || [],
    featuredImage,
    author: req.user!._id,
    isPublished: isPublished || false,
    publishedAt: isPublished ? new Date() : undefined,
  });

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    data: { blog },
  });
});

/**
 * Update blog (admin/superadmin)
 */
export const updateBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, excerpt, content, category, tags, featuredImage, isPublished } = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  // Update fields
  if (title) {
    blog.title = title;
    blog.slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (excerpt) blog.excerpt = excerpt;
  if (content) blog.content = content;
  if (category) blog.category = category;
  if (tags) blog.tags = tags;
  if (featuredImage !== undefined) blog.featuredImage = featuredImage;

  // Handle publishing
  if (isPublished !== undefined) {
    blog.isPublished = isPublished;
    if (isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
  }

  await blog.save();

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully',
    data: { blog },
  });
});

/**
 * Delete blog (admin/superadmin)
 */
export const deleteBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

/**
 * Toggle blog publish status (admin/superadmin)
 */
export const toggleBlogStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  blog.isPublished = !blog.isPublished;
  if (blog.isPublished && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }

  await blog.save();

  res.status(200).json({
    success: true,
    message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
    data: { blog },
  });
});
