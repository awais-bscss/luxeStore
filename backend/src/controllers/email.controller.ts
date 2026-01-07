import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import nodemailer from 'nodemailer';
import SystemSettings from '../models/SystemSettings.model';

export const sendEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { to, subject, message } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!to || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Please provide to, subject, and message',
      });
      return;
    }

    // Get admin email from settings
    const settings = await SystemSettings.findOne();
    const adminEmail = settings?.storeEmail || process.env.EMAIL_USER;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare attachments
    const attachments = files?.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    })) || [];

    // Send email
    await transporter.sendMail({
      from: `"${settings?.storeName || 'LuxeStore'}" <${adminEmail}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Message from ${settings?.storeName || 'LuxeStore'}</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from ${settings?.storeName || 'LuxeStore'} admin panel.
          </p>
        </div>
      `,
      attachments,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
};
