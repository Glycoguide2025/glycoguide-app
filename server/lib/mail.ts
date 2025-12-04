import sgMail from '@sendgrid/mail';

// SendGrid Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = {
  email: 'support@glycoguide.app',
  name: 'GlycoGuide Team'
};

// Dynamic Template IDs
const TEMPLATES = {
  WELCOME: 'd-810246aa551b4a8ebfa01aa4eb47b757',
  RECIPE_SHARE: 'd-c2aa73b72d0f409dbf4ae3e699f0fe97',
  PASSWORD_RESET: 'd-972f83dd451f4c6c8342be023ee51925',
  MINDFUL_CHECKIN: 'd-85da44a023db4538a39684188fc591f1',
} as const;

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Email validation
export const isEmailAllowed = (email: string): boolean => {
  const allowlist = process.env.EMAIL_TEST_ALLOWLIST?.split(',').map(e => e.trim()) || [];
  return allowlist.includes(email);
};

// Test connection
export const verifyConnection = async (): Promise<{ ok: boolean; error?: string }> => {
  if (!SENDGRID_API_KEY) {
    return { 
      ok: false, 
      error: 'SENDGRID_API_KEY not configured' 
    };
  }
  
  try {
    // SendGrid doesn't have a dedicated verify method, but we can check if the API key is set
    return { ok: true };
  } catch (error) {
    console.error('SendGrid Connection Error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Send email with dynamic template
interface SendTemplateEmailOptions {
  to: string;
  templateId: string;
  dynamicData?: Record<string, any>;
}

export const sendTemplateEmail = async (options: SendTemplateEmailOptions): Promise<{ ok: boolean; messageId?: string; error?: string }> => {
  if (!SENDGRID_API_KEY) {
    return { 
      ok: false, 
      error: 'SENDGRID_API_KEY not configured' 
    };
  }

  try {
    const msg = {
      to: options.to,
      from: FROM_EMAIL,
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicData || {},
    };

    const result = await sgMail.send(msg);
    
    return { 
      ok: true
    };
  } catch (error) {
    console.error('SendGrid Email Send Error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

// Send Welcome Email (uses dynamic template)
export const sendWelcomeEmail = async (
  to: string, 
  userName: string
): Promise<{ ok: boolean; error?: string }> => {
  return await sendTemplateEmail({
    to,
    templateId: TEMPLATES.WELCOME,
    dynamicData: {
      first_name: userName,
    },
  });
};

// Send Recipe Share Email
export const sendRecipeShareEmail = async (
  to: string,
  userName: string,
  recipeUrl: string,
  recipeName?: string
): Promise<{ ok: boolean; error?: string }> => {
  return await sendTemplateEmail({
    to,
    templateId: TEMPLATES.RECIPE_SHARE,
    dynamicData: {
      first_name: userName,
      recipe_url: recipeUrl,
      recipe_name: recipeName || 'your personalized recipe',
    },
  });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  resetLink: string
): Promise<{ ok: boolean; error?: string }> => {
  // Use direct HTML email instead of template for better reliability
  if (!SENDGRID_API_KEY) {
    return { 
      ok: false, 
      error: 'SENDGRID_API_KEY not configured' 
    };
  }

  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject: 'Reset Your GlycoGuide Password',
      html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; padding: 20px;"><div style="background: #86A873; padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">GlycoGuide</h1></div><div style="padding: 30px; background: #ffffff;"><h2>Reset Your Password</h2><p>Hi ${userName},</p><p>Click the button below to reset your password:</p><p style="text-align: center; margin: 30px 0;"><a href="${resetLink}" style="background: #86A873; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p><p>Or copy this link: ${resetLink}</p><p>This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p></div></body></html>`,
      text: `Reset Your GlycoGuide Password\n\nHi ${userName},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n---\nGlycoGuide\nhello@glycoguide.app`,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      }
    };

    console.log('📧 Sending password reset email:', { to, subject: msg.subject });
    const result = await sgMail.send(msg);
    console.log('📧 SendGrid response:', result[0].statusCode);
    
    return { 
      ok: true
    };
  } catch (error) {
    console.error('SendGrid Send Error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Send Mindful Check-in Email (for future engagement features)
export const sendMindfulCheckinEmail = async (
  to: string,
  userName: string
): Promise<{ ok: boolean; error?: string }> => {
  return await sendTemplateEmail({
    to,
    templateId: TEMPLATES.MINDFUL_CHECKIN,
    dynamicData: {
      first_name: userName,
    },
  });
};

// Test email sending (for development/testing only)
export const sendTestEmail = async (to: string): Promise<{ ok: boolean; error?: string }> => {
  // Use welcome template for testing
  return await sendWelcomeEmail(to, 'Test User');
};

// Generic email sending (fallback for custom emails)
export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<{ ok: boolean; messageId?: string; error?: string }> => {
  if (!SENDGRID_API_KEY) {
    return { 
      ok: false, 
      error: 'SENDGRID_API_KEY not configured' 
    };
  }

  try {
    const msg: any = {
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
    };

    // Add text or html content
    if (options.html) {
      msg.html = options.html;
    }
    if (options.text) {
      msg.text = options.text;
    }

    const result = await sgMail.send(msg);
    
    return { 
      ok: true
    };
  } catch (error) {
    console.error('SendGrid Email Send Error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};
