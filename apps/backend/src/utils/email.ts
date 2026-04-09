import nodemailer from 'nodemailer';
import { escapeHtml } from './sanitize';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_PORT === '465',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const FROM = process.env.SMTP_FROM || 'noreply@haarlemmermeervoorelkaar.nl';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  const safeName = escapeHtml(firstName);
  const url = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: `"Haarlemmermeer Voor Elkaar" <${FROM}>`,
    to: email,
    subject: 'Bevestig je e-mailadres | Confirm your email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1A1A8C">Welkom, ${safeName}!</h2>
        <p>Bevestig je e-mailadres door op de knop hieronder te klikken:</p>
        <a href="${url}" style="background:#6DC82A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          E-mailadres bevestigen
        </a>
        <p style="color:#666;font-size:13px">Of kopieer deze link: ${url}</p>
        <hr>
        <p style="color:#666;font-size:13px">Welcome, ${safeName}! Please confirm your email address by clicking the button above.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: `"Haarlemmermeer Voor Elkaar" <${FROM}>`,
    to: email,
    subject: 'Wachtwoord opnieuw instellen',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1A1A8C">Wachtwoord opnieuw instellen</h2>
        <p>Je hebt een verzoek ingediend om je wachtwoord te resetten. Klik op de knop:</p>
        <a href="${url}" style="background:#6DC82A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          Wachtwoord resetten
        </a>
        <p style="color:#666;font-size:13px">Deze link is 1 uur geldig.</p>
      </div>
    `,
  });
}

export async function sendMessageNotification(
  receiverEmail: string,
  receiverName: string,
  senderName: string,
  listingTitle: string,
  messagePreview: string
) {
  const safeReceiver = escapeHtml(receiverName);
  const safeSender = escapeHtml(senderName);
  const safeTitle = escapeHtml(listingTitle);
  const safePreview = escapeHtml(messagePreview.substring(0, 200));

  await transporter.sendMail({
    from: `"Haarlemmermeer Voor Elkaar" <${FROM}>`,
    to: receiverEmail,
    subject: `Nieuw bericht over "${safeTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1A1A8C">Nieuw bericht</h2>
        <p>Hoi ${safeReceiver},</p>
        <p><strong>${safeSender}</strong> heeft je een bericht gestuurd over <strong>&ldquo;${safeTitle}&rdquo;</strong>:</p>
        <blockquote style="border-left:4px solid #6DC82A;margin:16px 0;padding:12px 16px;background:#f9f9f9;color:#333">
          ${safePreview}${messagePreview.length > 200 ? '&hellip;' : ''}
        </blockquote>
        <a href="${FRONTEND_URL}/inbox" style="background:#6DC82A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
          Bekijk bericht
        </a>
        <p style="color:#666;font-size:13px">Je e-mailadres wordt nooit gedeeld zonder jouw toestemming.</p>
      </div>
    `,
  });
}
