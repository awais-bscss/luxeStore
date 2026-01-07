import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import JobApplication from '../models/JobApplication.model';
import { NotFoundError } from '../utils/errors';

/**
 * Download resume - Direct redirect without modifications
 * Let Cloudinary handle the file serving directly
 */
export const downloadResume = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.query;

    if (!applicationId || typeof applicationId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
      return;
    }

    // Fetch the application
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    console.log('Download request for application:', application._id);
    console.log('Resume URL:', application.resume);

    if (!application.resume) {
      res.status(404).json({
        success: false,
        message: 'Resume not found for this application',
      });
      return;
    }

    // Check if it's an old incompatible URL (private/authenticated type)
    if (application.resume.includes('/private/') || application.resume.includes('type=authenticated')) {
      console.error('Old incompatible resume URL detected:', application._id);

      res.status(410).json({
        success: false,
        message: 'This resume was uploaded with an old system and cannot be downloaded. Please ask the applicant to resubmit their application.',
        oldUrl: true,
        applicationId: application._id
      });
      return;
    }

    // Just redirect directly to the Cloudinary URL
    // Don't modify it - let Cloudinary serve it as-is
    console.log('Redirecting to:', application.resume);

    res.redirect(application.resume);
  } catch (error: any) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message,
    });
  }
};
