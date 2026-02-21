"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let NotificationsService = class NotificationsService {
    constructor(config) {
        this.config = config;
        this.resend = null;
        const get = (key, def) => this.config?.get?.(key) ?? process.env[key] ?? def;
        const apiKey = get('RESEND_API_KEY');
        if (apiKey)
            this.resend = new resend_1.Resend(apiKey);
        this.fromEmail = get('EMAIL_FROM', 'OrderBridge <onboarding@resend.dev>');
        this.baseUrl = get('FRONTEND_URL', 'http://localhost:3000');
    }
    async sendVerificationEmail(email, name, token) {
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
    async sendPasswordResetEmail(email, name, token) {
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
    async sendOrderCreatedEmail(sellerEmail, sellerName, orderId, buyerName) {
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
    async sendOrderStatusChangedEmail(buyerEmail, buyerName, orderId, status) {
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map