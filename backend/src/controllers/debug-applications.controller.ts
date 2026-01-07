import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import JobApplication from '../models/JobApplication.model';

/**
 * Debug endpoint to check application resume URLs
 */
export const debugApplications = async (_req: AuthRequest, res: Response) => {
  try {
    const applications = await JobApplication.find()
      .select('_id applicantName resume resumePublicId createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const debugInfo = applications.map(app => ({
      id: app._id,
      applicantName: app.applicantName,
      createdAt: app.createdAt,
      resumeUrl: app.resume,
      hasResumePublicId: !!app.resumePublicId,
      isOldFormat: app.resume?.includes('/private/') || app.resume?.includes('type=authenticated'),
      urlType: app.resume?.includes('/private/') ? 'OLD (BROKEN)' :
        app.resume?.includes('/raw/upload/') ? 'NEW (WORKING)' :
          'UNKNOWN'
    }));

    res.status(200).json({
      success: true,
      count: applications.length,
      applications: debugInfo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};
