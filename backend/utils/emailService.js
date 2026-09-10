const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Gmail support
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const smtpPort = parseInt(process.env.SMTP_PORT) || 465;

  // Localhost Postfix — no auth needed (same server)
  if (smtpHost === 'localhost' || smtpHost === '127.0.0.1') {
    return nodemailer.createTransport({
      host: 'localhost',
      port: smtpPort,
      secure: false,
      tls: { rejectUnauthorized: false },
    });
  }

  // External custom SMTP (Hostinger or custom)
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
const sendVerificationEmail = async (toEmail, code) => {
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || 'no-reply@zenivio.it.com';
  const replyToEmail = process.env.REPLY_TO || 'no-reply@zenivio.it.com';
  const messageId = `<zenivio-verify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@zenivio.it.com>`;

  const mailOptions = {
    from: `"Zenivio" <${senderEmail}>`,
    replyTo: replyToEmail,
    to: toEmail,
    subject: `Zenivio - Your verification code is ${code}`,
    messageId,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'List-Unsubscribe': `<mailto:${replyToEmail}?subject=Unsubscribe>`,
      'X-Entity-Ref-ID': messageId,
    },
    text: `Your Zenivio verification code is: ${code}\n\nUse this 6-digit code to verify your email address. This code expires in 10 minutes.\n\nSecurity Notice: Never share this code with anyone. Zenivio support will never ask for your verification code.\n\nIf you did not request this, you can safely ignore this email.\n\nZenivio Technologies - https://zenivio.it.com`,
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Zenivio Verification Code</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); height: 5px; line-height: 5px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 36px 40px 20px; text-align: center; background-color: #ffffff;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 48px; height: 48px; line-height: 48px; border-radius: 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">Z</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">Zenivio</h1>
                    <span style="display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px;">Account Verification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 40px 32px;">
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">Verify Your Email Address</h2>
              <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                Welcome to <strong>Zenivio</strong>! Use the 6-digit one-time code below to verify your email address and secure your account.
              </p>

              <!-- Modern OTP Code Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; margin: 20px 0;">
                <tr>
                  <td align="center" style="padding: 24px 16px;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Verification Code</div>
                    <div style="font-family: 'SF Mono', Consolas, Monaco, 'Courier New', monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4338ca; padding: 2px 0; margin-left: 12px; line-height: 1.1;">${code}</div>
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background-color: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; border: 1px solid #e0e7ff;">⏰ Valid for 10 minutes</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf5ff; border-radius: 14px; border: 1px solid #f3e8ff; margin: 20px 0 12px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b21a8;">
                      <strong>Security Tip:</strong> Never share this code with anyone. Zenivio staff will never ask for your verification code or password.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Clean Modern Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">Zenivio Technologies</p>
              <p style="margin: 0 0 10px; font-size: 11px; color: #94a3b8;">Connecting friends, opportunities, and digital creators.</p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; 2026 Zenivio. All rights reserved. &bull; <a href="https://zenivio.it.com" style="color: #6366f1; text-decoration: none; font-weight: 600;">zenivio.it.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const transporter = createTransporter();

  const senderEmail = process.env.EMAIL_USER || 'no-reply@zenivio.it.com';
  const replyToEmail = process.env.REPLY_TO || 'no-reply@zenivio.it.com';

  const mailOptions = {
    from: `"Zenivio" <${senderEmail}>`,
    replyTo: replyToEmail,
    to: toEmail,
    subject: 'Reset your Zenivio password',
    text: `Reset your Zenivio password:\n\nClick the link below to set a new password. This link is valid for 1 hour:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.\n\nZenivio Technologies - https://zenivio.it.com`,
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Reset Password - Zenivio</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); height: 5px; line-height: 5px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 36px 40px 20px; text-align: center; background-color: #ffffff;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 48px; height: 48px; line-height: 48px; border-radius: 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">Z</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">Zenivio</h1>
                    <span style="display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px;">Security &amp; Account</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 40px 32px;">
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">Reset Your Password</h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                We received a request to reset your Zenivio account password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 14px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);">Reset Password</a>
              </div>

              <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">Zenivio Technologies</p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; 2026 Zenivio. All rights reserved. &bull; <a href="https://zenivio.it.com" style="color: #6366f1; text-decoration: none; font-weight: 600;">zenivio.it.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2.1 PASSWORD RESET 6-DIGIT OTP EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendPasswordResetOTPEmail = async (toEmail, code) => {
  const transporter = createTransporter();

  const senderEmail = process.env.EMAIL_USER || 'no-reply@zenivio.it.com';
  const replyToEmail = process.env.REPLY_TO || 'no-reply@zenivio.it.com';
  const messageId = `<zenivio-reset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@zenivio.it.com>`;

  const mailOptions = {
    from: `"Zenivio" <${senderEmail}>`,
    replyTo: replyToEmail,
    to: toEmail,
    subject: `Zenivio - Password reset code: ${code}`,
    messageId,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'List-Unsubscribe': `<mailto:${replyToEmail}?subject=Unsubscribe>`,
      'X-Entity-Ref-ID': messageId,
    },
    text: `Your Zenivio password reset code is: ${code}\n\nUse this 6-digit code to reset your account password. This code expires in 10 minutes.\n\nSecurity Notice: Never share this code with anyone. Zenivio support will never ask for your verification code.\n\nIf you did not request this, you can safely ignore this email.\n\nZenivio Technologies - https://zenivio.it.com`,
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Reset Password Code - Zenivio</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); height: 5px; line-height: 5px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 36px 40px 20px; text-align: center; background-color: #ffffff;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 48px; height: 48px; line-height: 48px; border-radius: 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">Z</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">Zenivio</h1>
                    <span style="display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px;">Password Reset Code</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 10px 40px 32px;">
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">Reset Your Password</h2>
              <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                We received a request to reset your Zenivio password. Enter this 6-digit verification code in the app to continue:
              </p>

              <!-- Modern OTP Code Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; margin: 20px 0;">
                <tr>
                  <td align="center" style="padding: 24px 16px;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">6-Digit Security Code</div>
                    <div style="font-family: 'SF Mono', Consolas, Monaco, 'Courier New', monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4338ca; padding: 2px 0; margin-left: 12px; line-height: 1.1;">${code}</div>
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background-color: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; border: 1px solid #e0e7ff;">⏰ Valid for 10 minutes</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf5ff; border-radius: 14px; border: 1px solid #f3e8ff; margin: 20px 0 12px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b21a8;">
                      <strong>Security Notice:</strong> Never share this code with anyone. Zenivio staff will never call or ask for your password reset code.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">Zenivio Technologies</p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; 2026 Zenivio. All rights reserved. &bull; <a href="https://zenivio.it.com" style="color: #6366f1; text-decoration: none; font-weight: 600;">zenivio.it.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADMIN APPOINTMENT & INVITATION EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSION_LABELS = {
  dashboard: 'Dashboard Overview & Real-time Analytics',
  users: 'User Management (Profiles, Balances, Bans)',
  transactions: 'Transactions & Withdrawal Processing',
  support: 'Support Tickets & Live Customer Chat',
  referrals: 'Referral Tracking & Commission Audits',
  posts: 'Community Feed & Post Moderation',
  articles: 'News & Blog Articles Publishing',
  missions: 'Daily & Weekly Missions Management',
  products: 'Digital Store & Products Management',
  announcements: 'Broadcast Global Announcements',
  verifications: 'ID Verification & Blue Badges',
  badges: 'Award Badges to Community Members',
  database: 'Database Backup & System Maintenance',
  settings: 'Global Platform Settings',
};

const sendAdminInvitationEmail = async ({ toEmail, email, name, temporaryPassword, tempPassword, role, permissions = [], loginUrl = 'https://zenivio.it.com/admin' }) => {
  const recipientEmail = toEmail || email;
  const passwordToUse = temporaryPassword || tempPassword;
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || 'no-reply@zenivio.it.com';
  const replyToEmail = process.env.REPLY_TO || 'no-reply@zenivio.it.com';

  const roleTitle = role === 'super_admin' ? 'Super Administrator' : 'Staff Administrator';

  const permissionsListHtml = permissions.length > 0
    ? permissions.map(p => `
        <li style="margin-bottom: 8px; color: #334155; font-size: 13px;">
          <strong style="color: #4f46e5;">✓ ${PERMISSION_LABELS[p] || p}</strong>
        </li>
      `).join('')
    : '<li style="color: #64748b; font-size: 13px;">Standard Administrator Access</li>';

  const permissionsText = permissions.length > 0
    ? permissions.map(p => `- ${PERMISSION_LABELS[p] || p}`).join('\n')
    : '- Standard Administrator Access';

  const mailOptions = {
    from: `"Zenivio" <${senderEmail}>`,
    replyTo: replyToEmail,
    to: recipientEmail,
    subject: 'Your Zenivio Administrator Account Details',
    text: `Congratulations ${name}!\n\nYou have been appointed as an Administrator (${roleTitle}) at Zenivio.\n\nLogin Portal: ${loginUrl}\nEmail: ${recipientEmail}\nTemporary Password: ${passwordToUse}\n\nYour Assigned Responsibilities:\n${permissionsText}\n\nSecurity Notice: Please log in and change your password immediately from the admin panel.\n\nZenivio Technologies - https://zenivio.it.com`,
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Admin Appointment - Zenivio</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%); height: 5px; line-height: 5px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px 20px; text-align: center; background-color: #ffffff;">
              <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 48px; height: 48px; line-height: 48px; border-radius: 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">Z</div>
              <h1 style="margin: 14px 0 2px; font-size: 24px; font-weight: 800; color: #0f172a;">Welcome to the Team! 🎉</h1>
              <span style="display: inline-block; background-color: #ede9fe; color: #6d28d9; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px;">
                ${roleTitle}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 10px 40px 30px;">
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Hello <strong>${name}</strong>,<br/><br/>
                Congratulations! You have been granted administrative access to the <strong>Zenivio Management Platform</strong>. Below are your login credentials and assigned duties:
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; margin: 0 0 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Access Credentials</div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="4">
                      <tr>
                        <td width="35%" style="font-size: 13px; color: #64748b; font-weight: 600;">Portal URL:</td>
                        <td style="font-size: 13px; color: #0f172a; font-weight: 700;"><a href="${loginUrl}" style="color: #4f46e5; text-decoration: none;">${loginUrl}</a></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; font-weight: 600;">Login Email:</td>
                        <td style="font-size: 13px; color: #0f172a; font-weight: 700;">${recipientEmail}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; font-weight: 600;">Password:</td>
                        <td style="font-size: 14px; font-family: monospace; color: #4338ca; font-weight: 900; background-color: #ede9fe; padding: 3px 10px; border-radius: 6px; display: inline-block; border: 1px solid #ddd6fe;">${passwordToUse}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Responsibilities Card -->
              <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                <div style="font-size: 10px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Assigned Duties &amp; Modules</div>
                <ul style="margin: 0; padding-left: 20px;">
                  ${permissionsListHtml}
                </ul>
              </div>

              <!-- Login CTA Button -->
              <div style="text-align: center; margin: 28px 0 20px;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 38px; border-radius: 14px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);">Log in to Admin Panel</a>
              </div>

              <!-- Security Notice -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; margin-top: 15px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400e;">
                      <strong>Security Tip:</strong> Please log in and immediately update your password via the in-panel Profile &amp; Security section. Never share your admin credentials.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">Zenivio Technologies &bull; Administration</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; 2026 Zenivio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Failed to send admin invitation email:', err);
    return null;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetOTPEmail, 
  sendAdminInvitationEmail 
};
