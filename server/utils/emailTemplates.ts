import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  // Only apply allowlist in development (when NODE_ENV is not 'production')
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const allowlist = process.env.EMAIL_TEST_ALLOWLIST?.split(",").map(e => e.trim());
  
  if (isDevelopment && allowlist && allowlist.length > 0 && !allowlist.includes(to)) {
    console.warn(`[DEV MODE] Blocked email to ${to} (not in allowlist)`);
    return;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM!,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Error sending email to ${to}:`, err);
  }
}

export const welcomeEmailTemplate = (name: string = "there") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to GlycoGuide</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .header { text-align: center; }
    .header img { width: 80px; margin-bottom: 20px; }
    h1 { color: #006644; font-size: 24px; margin-bottom: 10px; }
    p { line-height: 1.6; font-size: 16px; }
    .button { display: inline-block; background: #006644; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://glycoguide.app/logo.png" alt="GlycoGuide Logo" />
      <h1>Welcome to GlycoGuide, ${name}!</h1>
    </div>
    <p>We're so excited to have you join the GlycoGuide community. 🎉</p>
    <p>Your account has been created successfully. You can now start exploring personalized recipes, nutrition plans, and health insights.</p>
    <p>Click below to get started:</p>
    <a class="button" href="https://app.glycoguide.app" target="_blank">Go to My Dashboard</a>
    <p>See you inside,<br><strong>The GlycoGuide Team</strong></p>
    <div class="footer">© ${new Date().getFullYear()} GlycoGuide. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const upgradeEmailTemplate = (name: string = "there") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Plan Upgraded</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4faf4; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .header { text-align: center; }
    .header img { width: 80px; margin-bottom: 20px; }
    h1 { color: #006644; font-size: 24px; margin-bottom: 10px; }
    p { line-height: 1.6; font-size: 16px; }
    .highlight { color: #006644; font-weight: bold; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://glycoguide.app/logo.png" alt="GlycoGuide Logo" />
      <h1>Your Plan Has Been Upgraded, ${name}!</h1>
    </div>
    <p>🎉 Congratulations! You've successfully upgraded your GlycoGuide subscription.</p>
    <p>Enjoy enhanced access to premium recipes, progress tracking, and full nutrition analytics.</p>
    <p>Log in anytime to explore your new features:</p>
    <p><a href="https://app.glycoguide.app" style="color:#006644;">app.glycoguide.app</a></p>
    <p>Thank you for growing with us,<br><strong>The GlycoGuide Team</strong></p>
    <div class="footer">© ${new Date().getFullYear()} GlycoGuide. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const downgradeEmailTemplate = (name: string = "there") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Plan Downgraded</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff8f8; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .header { text-align: center; }
    .header img { width: 80px; margin-bottom: 20px; }
    h1 { color: #b00020; font-size: 24px; margin-bottom: 10px; }
    p { line-height: 1.6; font-size: 16px; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://glycoguide.app/logo.png" alt="GlycoGuide Logo" />
      <h1>We've Updated Your Plan, ${name}</h1>
    </div>
    <p>Your subscription has been downgraded as requested. You'll still have access to your basic GlycoGuide features.</p>
    <p>If you ever wish to return to a premium plan, it's easy to upgrade anytime.</p>
    <p>We appreciate you being part of our community,</p>
    <p><strong>The GlycoGuide Team</strong></p>
    <div class="footer">© ${new Date().getFullYear()} GlycoGuide. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const passwordResetEmailTemplate = (name: string = "there", resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset Your GlycoGuide Password</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .header { text-align: center; }
    .header img { width: 80px; margin-bottom: 20px; }
    h1 { color: #006644; font-size: 24px; margin-bottom: 10px; }
    p { line-height: 1.6; font-size: 16px; }
    .button { display: inline-block; background: #006644; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 30px; }
    .warning { background: #fff3cd; padding: 12px; border-radius: 6px; margin: 16px 0; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://glycoguide.app/logo.png" alt="GlycoGuide Logo" />
      <h1>Reset Your Password, ${name}</h1>
    </div>
    <p>You recently requested to reset your password for your GlycoGuide account. Click the button below to reset it:</p>
    <a class="button" href="${resetUrl}" target="_blank">Reset Password</a>
    <p style="margin-top: 20px; font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 14px; color: #0066cc;">${resetUrl}</p>
    <div class="warning">
      <strong>⚠️ Security Notice:</strong> This reset link will expire in 1 hour. If you didn't request this, please ignore this email or contact us if you have concerns.
    </div>
    <p>Thanks,<br><strong>The GlycoGuide Team</strong></p>
    <div class="footer">© ${new Date().getFullYear()} GlycoGuide. All rights reserved.</div>
  </div>
</body>
</html>
`;

// Phase 5: Emotion-Aware Reminder Templates
export const emotionAwareCheckInTemplate = (name: string = "there", timeOfDay: 'morning' | 'evening' = 'morning') => {
  const morningContent = {
    subject: `Good morning, ${name} — How are you feeling today?`,
    emoji: '🌅',
    greeting: 'Good morning',
    message: `Take a moment to check in with yourself. How's your energy? Your mood? Your body?`,
    action: 'Log how you\'re feeling and set a gentle intention for your day.',
  };

  const eveningContent = {
    subject: `${name}, how did today feel for you? 💚`,
    emoji: '🌙',
    greeting: 'Evening check-in',
    message: `Before the day ends, take a breath. Reflect on how you felt today — your energy, your mood, your wellness moments.`,
    action: 'Log your reflections and acknowledge what went well.',
  };

  const content = timeOfDay === 'morning' ? morningContent : eveningContent;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${content.subject}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f9f4; margin: 0; padding: 0; color: #4a4a4a; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #F0F4F0 0%, #E8F1E8 100%); padding: 40px 30px; border-radius: 16px; box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 24px; }
    .header .emoji { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #A9B89E; font-size: 26px; margin: 0 0 8px 0; font-weight: 600; }
    .message { background: #ffffff; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #A9B89E; }
    .message p { line-height: 1.7; font-size: 16px; margin: 12px 0; color: #5C5044; }
    .cta { text-align: center; margin: 28px 0; }
    .button { display: inline-block; background: #A9B89E; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background 0.3s; }
    .button:hover { background: #8fa083; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
    .heart { color: #A9B89E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">${content.emoji}</div>
      <h1>${content.greeting}, ${name}</h1>
    </div>
    
    <div class="message">
      <p>${content.message}</p>
      <p><strong>${content.action}</strong></p>
    </div>

    <div class="cta">
      <a class="button" href="https://app.glycoguide.app" target="_blank">Check In Now</a>
    </div>

    <p style="text-align: center; color: #7a7a7a; font-size: 14px; margin-top: 24px;">
      You're on your wellness journey — one gentle step at a time <span class="heart">💚</span>
    </p>

    <div class="footer">
      <p>You're receiving this because you opted in for wellness check-ins.</p>
      <p><a href="https://app.glycoguide.app/settings" style="color: #A9B89E;">Manage your reminder preferences</a></p>
      <p>© ${new Date().getFullYear()} GlycoGuide. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
