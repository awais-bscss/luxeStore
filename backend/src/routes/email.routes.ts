import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/permissions';
import { sendEmail } from '../controllers/email.controller';

const router = Router();

// Configure Multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Allow PDF, images, Excel, and ZIP files
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Excel, and ZIP files are allowed.'));
    }
  },
});

router.post(
  '/send',
  protect,
  isAdmin,
  upload.array('attachments', 5), // Max 5 files
  sendEmail
);

export default router;
