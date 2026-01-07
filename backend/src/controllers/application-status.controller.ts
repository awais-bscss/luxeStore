import { Response, Request } from 'express';
import JobApplication from '../models/JobApplication.model';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Check application status by email (public endpoint)
 * Allows candidates to track their application status
 */
export const checkApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Email is required',
    });
    return;
  }

  // Find all applications for this email
  const applications = await JobApplication.find({ email: email.toLowerCase() })
    .populate('job', 'title department location type')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      applications: applications.map(app => ({
        _id: app._id,
        job: app.job,
        applicantName: app.applicantName,
        status: app.status,
        appliedAt: app.createdAt,
      })),
    },
  });
});
