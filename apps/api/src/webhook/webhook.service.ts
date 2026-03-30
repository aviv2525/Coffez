import { Injectable, Logger } from '@nestjs/common';

export interface WebhookOrderPayload {
  event: 'order.created' | 'order.status_changed';
  orderId: string;
  status: string;
  buyerName: string;
  menuItemTitle: string;
  note?: string | null;
  scheduledFor?: string | null;
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async sendOrderEvent(webhookUrl: string, payload: WebhookOrderPayload): Promise<void> {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        this.logger.warn(`Webhook ${webhookUrl} returned ${res.status}`);
      }
    } catch (err) {
      // Non-blocking — never fail the order flow because of a webhook error
      this.logger.warn(`Webhook delivery failed for ${webhookUrl}: ${err}`);
    }
  }
}
