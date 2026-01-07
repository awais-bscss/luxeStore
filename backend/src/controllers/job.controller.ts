import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import Job from '../models/Job.model';
import JobApplication from '../models/JobApplication.model';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ValidationError } from '../utils/errors';
import cloudinary from '../config/cloudinary.config';
import streamifier from 'streamifier';

/**
 * Get all active jobs (public)
 */
export const getActiveJobs = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Only show active jobs that are not deleted
  const jobs = await Job.find({ isActive: true, isDeleted: false })
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

/**
 * Get all jobs (admin only)
 */
export const getAllJobs = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Admin can see all jobs including deleted ones (for records)
  const jobs = await Job.find()
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

/**
 * Get single job by ID
 */
export const getJobById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await Job.findById(id).populate('postedBy', 'name');

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  res.status(200).json({
    success: true,
    data: { job },
  });
});

/**
 * Create new job (admin only)
 */
export const createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const jobData = {
    ...req.body,
    postedBy: req.user!._id,
  };

  const job = await Job.create(jobData);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job },
  });
});

/**
 * Update job (admin only)
 */
export const updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await Job.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: { job },
  });
});

/**
 * Delete job (admin only)
 */
export const deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Soft delete: mark as deleted instead of removing from database
  const job = await Job.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  // Keep applications for compliance and historical records
  // Applications remain in database with reference to deleted job

  res.status(200).json({
    success: true,
    message: 'Job archived successfully. Applications preserved for records.',
  });
});

/**
 * Toggle job active status (admin only)
 */
export const toggleJobStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await Job.findById(id);

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  job.isActive = !job.isActive;
  await job.save();

  res.status(200).json({
    success: true,
    message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { job },
  });
});

/**
 * Submit job application (public)
 */
export const submitApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  // Check if job exists and is active
  const job = await Job.findById(jobId);

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  if (!job.isActive) {
    throw new ValidationError('This job is no longer accepting applications');
  }

  // Check if user already applied
  const existingApplication = await JobApplication.findOne({
    job: jobId,
    email: req.body.email,
  });

  if (existingApplication) {
    throw new ValidationError('You have already applied for this position');
  }

  // Check if file was uploaded
  if (!req.file) {
    throw new ValidationError('Resume is required');
  }

  // Upload resume to Cloudinary
  // Using standard upload (not private) for better reliability
  // Security is handled by the protected download endpoint
  const uploadResult: any = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'luxestore/resumes',
        resource_type: 'raw',
        public_id: `${Date.now()}-${req.file!.originalname.replace(/\.[^/.]+$/, '')}`,
        // Using default 'upload' type for reliability
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
  });

  // Store the secure URL and public_id
  // The URL is publicly accessible but hard to guess
  // Only admins can access the download endpoint to get the URL
  const resumeUrl = uploadResult.secure_url;
  const resumePublicId = uploadResult.public_id;

  // Create application with form data
  const application = await JobApplication.create({
    job: jobId,
    applicantName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    coverLetter: req.body.coverLetter,
    portfolio: req.body.portfolio || req.body.linkedIn,
    linkedIn: req.body.portfolio,
    resume: resumeUrl, // Store the secure URL
    resumePublicId: resumePublicId, // Store public_id for reference
  });

  // Increment application count
  job.applicationCount += 1;
  await job.save();

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application },
  });
});

/**
 * Get all applications for a job (admin only)
 */
export const getJobApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  const applications = await JobApplication.find({ job: jobId })
    .populate('job', 'title department')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { applications },
  });
});

/**
 * Get all applications (admin only)
 */
export const getAllApplications = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const applications = await JobApplication.find()
    .populate('job', 'title department location')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { applications },
  });
});

/**
 * Update application status (admin only)
 */
export const updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const application = await JobApplication.findByIdAndUpdate(
    id,
    {
      status,
      notes,
      reviewedBy: req.user!._id,
      reviewedAt: new Date(),
    },
    { new: true }
  );

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: { application },
  });
});

/**
 * Delete application (admin only)
 */
export const deleteApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const application = await JobApplication.findByIdAndDelete(id);

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  // Decrement application count
  await Job.findByIdAndUpdate(application.job, {
    $inc: { applicationCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully',
  });
});
