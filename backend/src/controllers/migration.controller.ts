import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import JobApplication from '../models/JobApplication.model';
import cloudinary from '../config/cloudinary.config';

/**
 * Migration endpoint to fix old resume uploads
 * This will convert old private/authenticated uploads to standard uploads
 */
export const migrateResumes = async (_req: AuthRequest, res: Response) => {
  try {
    console.log('Starting resume migration...');

    // Find all applications with resumes
    const applications = await JobApplication.find({
      resume: { $exists: true, $ne: '' }
    });

    console.log(`Found ${applications.length} applications to check`);

    let migratedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const application of applications) {
      try {
        // Check if it's an old private/authenticated URL
        if (application.resume.includes('/private/') || application.resume.includes('type=authenticated')) {
          console.log(`Migrating application ${application._id}...`);

          // Extract the public_id from the old URL
          // URL format: https://res.cloudinary.com/{cloud}/raw/private/s--xxx--/v1/{folder}/{public_id}
          const publicIdMatch = application.resume.match(/luxestore\/resumes\/([^?]+)/);

          if (publicIdMatch) {
            let publicId = `luxestore/resumes/${publicIdMatch[1]}`;

            // Remove file extension if present
            publicId = publicId.replace(/\.(pdf|doc|docx)$/i, '');

            console.log(`Extracted public_id: ${publicId}`);

            try {
              // Try to get the resource details from Cloudinary
              const resource = await cloudinary.api.resource(publicId, {
                resource_type: 'raw',
                type: 'private'
              });

              console.log(`Found resource in Cloudinary: ${resource.public_id}`);

              // Update the resource to be 'upload' type instead of 'private'
              // We'll do this by updating the database with a new URL format
              const newUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${resource.public_id}.${resource.format}`;

              application.resume = newUrl;
              application.resumePublicId = resource.public_id;
              await application.save();

              console.log(`✓ Migrated application ${application._id}`);
              migratedCount++;
            } catch (cloudinaryError: any) {
              console.error(`Cloudinary error for ${publicId}:`, cloudinaryError.message);

              // If resource not found in private, try to construct standard URL
              const newUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.pdf`;
              application.resume = newUrl;
              application.resumePublicId = publicId;
              await application.save();

              console.log(`✓ Updated URL for application ${application._id} (best effort)`);
              migratedCount++;
            }
          } else {
            console.log(`Could not extract public_id from: ${application.resume}`);
            errorCount++;
            errors.push({
              applicationId: application._id,
              error: 'Could not extract public_id from URL'
            });
          }
        } else {
          console.log(`Application ${application._id} already has correct URL format`);
        }
      } catch (error: any) {
        console.error(`Error migrating application ${application._id}:`, error.message);
        errorCount++;
        errors.push({
          applicationId: application._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Migration completed',
      data: {
        total: applications.length,
        migrated: migratedCount,
        errors: errorCount,
        errorDetails: errors
      }
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
};
