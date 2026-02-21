import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private readonly config;
    private resend;
    private fromEmail;
    private baseUrl;
    constructor(config: ConfigService);
    sendVerificationEmail(email: string, name: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>;
    sendOrderCreatedEmail(sellerEmail: string, sellerName: string, orderId: string, buyerName: string): Promise<void>;
    sendOrderStatusChangedEmail(buyerEmail: string, buyerName: string, orderId: string, status: string): Promise<void>;
}
