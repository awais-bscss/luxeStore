import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import ContactMessage from '../models/ContactMessage.model';
import emailService from '../services/email.service';

/**
 * Submit a contact message
 * @route POST /api/contact
 * @access Public
 */
export const submitContactMessage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Get IP address
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      null;

    // Get userId if user is logged in
    const userId = req.user?._id || null;

    // Rate limiting: Check if user/IP has sent a message in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentMessage = await ContactMessage.findOne({
      $or: [
        { email: email, createdAt: { $gte: tenMinutesAgo } },
        ...(ipAddress ? [{ ipAddress: ipAddress, createdAt: { $gte: tenMinutesAgo } }] : []),
      ],
    }).sort({ createdAt: -1 });

    if (recentMessage) {
      const timeLeft = Math.ceil(
        (10 * 60 * 1000 - (Date.now() - recentMessage.createdAt.getTime())) / 1000 / 60
      );
      res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} minute(s) before sending another message.`,
      });
      return;
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      userId,
      ipAddress,
      status: 'pending',
    });

    // Send email notification to admin
    try {
      await emailService.sendContactNotification({
        name,
        email,
        subject,
        message,
        userId: userId?.toString(),
        ipAddress: ipAddress || undefined,
      });

      // Send confirmation email to user
      await emailService.sendConfirmationEmail(email, name);
    } catch (emailError: any) {
      console.error('Email sending failed for contact message:', emailError.message);
      // Don't fail the request if email fails - message is still saved
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        contactMessage: {
          _id: contactMessage._id,
          name: contactMessage.name,
          email: contactMessage.email,
          subject: contactMessage.subject,
          status: contactMessage.status,
          createdAt: contactMessage.createdAt,
        },
      },
    });
  }
);

/**
 * Get all contact messages (Admin only)
 * @route GET /api/contact
 * @access Private/Admin
 */
export const getAllContactMessages = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await ContactMessage.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * Get a single contact message (Admin only)
 * @route GET /api/contact/:id
 * @access Private/Admin
 */
export const getContactMessage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const message = await ContactMessage.findById(req.params.id).populate(
      'userId',
      'name email'
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message },
    });
  }
);

/**
 * Update contact message status (Admin only)
 * @route PUT /api/contact/:id/status
 * @access Private/Admin
 */
export const updateMessageStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { status } = req.body;

    if (!['pending', 'replied', 'resolved'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: { message },
    });
  }
);

/**
 * Delete contact message (Admin only)
 * @route DELETE /api/contact/:id
 * @access Private/Admin
 */
export const deleteContactMessage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  }
);
