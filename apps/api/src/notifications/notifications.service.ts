import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const get = (key: string, def?: string) => this.config?.get?.(key) ?? process.env[key] ?? def;
    const apiKey = get('RESEND_API_KEY');
    if (apiKey) this.resend = new Resend(apiKey);
    this.fromEmail = get('EMAIL_FROM', 'OrderBridge <onboarding@resend.dev>');
    this.baseUrl = get('FRONTEND_URL', 'http://localhost:3000');
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${this.baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const html = `
      <p>Hi ${name},</p>
      <p>Please verify your email by clicking: <a href="${url}">Verify Email</a></p>
      <p>Or copy this link: ${url}</p>
      <p>Link expires in 24 hours.</p>
    `;
    if (this.resend) {
      await this.resend.emails.send({ from: this.fromEmail, to: email, subject: 'Verify your email', html });
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const url = `${this.baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const html = `
      <p>Hi ${name},</p>
      <p>Reset your password: <a href="${url}">Reset Password</a></p>
      <p>Or copy: ${url}</p>
      <p>Link expires in 1 hour.</p>
    `;
    if (this.resend) {
      await this.resend.emails.send({ from: this.fromEmail, to: email, subject: 'Reset your password', html });
    }
  }

  async sendOrderCreatedEmail(sellerEmail: string, sellerName: string, orderId: string, buyerName: string) {
    const url = `${this.baseUrl}/orders`;
    const html = `
      <p>Hi ${sellerName},</p>
      <p>New order #${orderId.slice(0, 8)} from ${buyerName}. <a href="${url}">View orders</a></p>
    `;
    if (this.resend) {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: sellerEmail,
        subject: 'New order received',
        html,
      });
    }
  }

  async sendOrderStatusChangedEmail(
    buyerEmail: string,
    buyerName: string,
    orderId: string,
    status: string,
  ) {
    const url = `${this.baseUrl}/orders`;
    const html = `
      <p>Hi ${buyerName},</p>
      <p>Order #${orderId.slice(0, 8)} status: ${status}. <a href="${url}">View orders</a></p>
    `;
    if (this.resend) {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: buyerEmail,
        subject: `Order update: ${status}`,
        html,
      });
    }
  }
}
