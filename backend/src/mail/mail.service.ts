import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type SendPasswordResetOptions = {
  to: string;
  firstName?: string | null;
  resetUrl: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return this.transporter;
  }

  private fromAddress(): string {
    return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@tinyframes.local';
  }

  buildPasswordResetHtml(options: SendPasswordResetOptions): string {
    const name = options.firstName?.trim() || 'there';
    const shopName = 'Tiny Frames';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Georgia,'Times New Roman',serif;color:#4a5d4e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fdfbf7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e2eedb;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 12px;background:linear-gradient(135deg,#e2eedb 0%,#fdfbf7 100%);">
              <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#4a5d4e;opacity:0.75;">${shopName}</p>
              <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#4a5d4e;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.65;color:#4a5d4e;">
              <p style="margin:0 0 16px;">Hi ${name},</p>
              <p style="margin:0 0 20px;">We received a request to reset the password for your ${shopName} account. Click the button below to choose a new password. This link expires in one hour.</p>
              <p style="margin:0 0 28px;text-align:center;">
                <a href="${options.resetUrl}" style="display:inline-block;padding:14px 28px;background:#d4a373;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;border-radius:12px;">Choose a new password</a>
              </p>
              <p style="margin:0 0 12px;font-size:14px;color:rgba(74,93,78,0.8);">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${options.resetUrl}" style="color:#d4a373;">${options.resetUrl}</a></p>
              <p style="margin:0;font-size:14px;color:rgba(74,93,78,0.75);">If you did not request this, you can safely ignore this email. Your password will stay the same.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;border-top:1px solid #e2eedb;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:rgba(74,93,78,0.65);">
              With care,<br />The ${shopName} team
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendPasswordResetEmail(options: SendPasswordResetOptions): Promise<void> {
    const subject = 'Reset your Tiny Frames password';
    const html = this.buildPasswordResetHtml(options);
    const text = `Reset your Tiny Frames password: ${options.resetUrl}\n\nThis link expires in one hour. If you did not request this, ignore this email.`;

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(
        `SMTP not configured — password reset link for ${options.to}: ${options.resetUrl}`,
      );
      return;
    }

    await transporter.sendMail({
      from: this.fromAddress(),
      to: options.to,
      subject,
      text,
      html,
    });
  }
}
