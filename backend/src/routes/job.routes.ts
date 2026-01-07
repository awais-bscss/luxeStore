import express from 'express';
import {
  getActiveJobs,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  submitApplication,
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/job.controller';
import { checkApplicationStatus } from '../controllers/application-status.controller';
import { protect, authorize } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/active', getActiveJobs);
router.get('/:id', getJobById);
router.post('/:jobId/apply', uploadResume.single('resume'), submitApplication);
router.get('/application-status/check', checkApplicationStatus); // Public status check

// Superadmin only routes
router.get('/', protect, authorize('superadmin'), getAllJobs);
router.post('/', protect, authorize('superadmin'), createJob);
router.put('/:id', protect, authorize('superadmin'), updateJob);
router.delete('/:id', protect, authorize('superadmin'), deleteJob);
router.patch('/:id/toggle-status', protect, authorize('superadmin'), toggleJobStatus);

// Application routes (superadmin only)
router.get('/:jobId/applications', protect, authorize('superadmin'), getJobApplications);
router.get('/applications/all', protect, authorize('superadmin'), getAllApplications);
router.patch('/applications/:id/status', protect, authorize('superadmin'), updateApplicationStatus);
router.delete('/applications/:id', protect, authorize('superadmin'), deleteApplication);

export default router;
