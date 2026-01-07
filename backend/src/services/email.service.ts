import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  ipAddress?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter - you'll need to configure this with your email service
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD, // Support both EMAIL_PASS and EMAIL_PASSWORD
      },
    };

    console.log('📧 Initializing email service with config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user ? '***' + emailConfig.auth.user.slice(-10) : 'NOT SET',
      pass: emailConfig.auth.pass ? '***' : 'NOT SET',
    });

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        console.error('❌ Email service verification failed:', error);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      console.log('📧 Sending email to:', options.to);
      const info = await this.transporter.sendMail({
        from: `"LuxeStore" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log('✅ Email sent successfully. Message ID:', info.messageId);
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendContactNotification(data: ContactEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #667eea; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd; white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ New Contact Message</h1>
              <p>You have received a new message from LuxeStore</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${data.name}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${data.subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${data.message}</div>
              </div>
              
              ${data.userId ? `
              <div class="field">
                <div class="label">User ID:</div>
                <div class="value">${data.userId}</div>
              </div>
              ` : ''}
              
              ${data.ipAddress ? `
              <div class="field">
                <div class="label">IP Address:</div>
                <div class="value">${data.ipAddress}</div>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>This message was sent from the LuxeStore contact form</p>
                <p>Received at: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
New Contact Message from LuxeStore

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

${data.userId ? `User ID: ${data.userId}` : ''}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}

Received at: ${new Date().toLocaleString()}
    `;

    await this.sendEmail({
      to: 'muhmmadawaistech@gmail.com',
      subject: `New Contact Message: ${data.subject}`,
      text,
      html,
    });
  }

  async sendConfirmationEmail(to: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for contacting LuxeStore! We have received your message and will get back to you as soon as possible.</p>
              <p>Our team typically responds within 24-48 hours during business days.</p>
              <p>Best regards,<br>The LuxeStore Team</p>
              <div class="footer">
                <p>This is an automated confirmation email from LuxeStore</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'We received your message - LuxeStore',
      html,
    });
  }
}

export default new EmailService();
