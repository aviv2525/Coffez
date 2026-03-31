import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePosIntegrationDto, UpdatePosIntegrationDto, CreateMenuItemMappingDto } from './dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  async getIntegration(sellerId: string) {
    return this.prisma.posIntegration.findUnique({
      where: { sellerId },
      include: { mappings: { include: { menuItem: { select: { id: true, title: true } } } } },
    });
  }

  async createIntegration(sellerId: string, dto: CreatePosIntegrationDto) {
    return this.prisma.posIntegration.create({
      data: {
        sellerId,
        provider: dto.provider,
        apiUrl: dto.apiUrl,
        apiKey: dto.apiKey,
        meta: (dto.meta ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async updateIntegration(sellerId: string, dto: UpdatePosIntegrationDto) {
    await this.ensureExists(sellerId);
    return this.prisma.posIntegration.update({
      where: { sellerId },
      data: {
        ...(dto.provider !== undefined && { provider: dto.provider }),
        ...(dto.apiUrl !== undefined && { apiUrl: dto.apiUrl }),
        ...(dto.apiKey !== undefined && { apiKey: dto.apiKey }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.meta !== undefined && { meta: dto.meta as Prisma.InputJsonValue }),
      },
    });
  }

  async deleteIntegration(sellerId: string) {
    await this.ensureExists(sellerId);
    await this.prisma.posIntegration.delete({ where: { sellerId } });
    return { success: true };
  }

  async upsertMapping(sellerId: string, dto: CreateMenuItemMappingDto) {
    const integration = await this.ensureExists(sellerId);
    return this.prisma.menuItemMapping.upsert({
      where: {
        posIntegrationId_menuItemId: {
          posIntegrationId: integration.id,
          menuItemId: dto.menuItemId,
        },
      },
      create: {
        posIntegrationId: integration.id,
        menuItemId: dto.menuItemId,
        externalId: dto.externalId,
        externalPrice: dto.externalPrice ?? null,
      },
      update: {
        externalId: dto.externalId,
        ...(dto.externalPrice !== undefined && { externalPrice: dto.externalPrice }),
      },
    });
  }

  async deleteMapping(sellerId: string, menuItemId: string) {
    const integration = await this.ensureExists(sellerId);
    await this.prisma.menuItemMapping.deleteMany({
      where: { posIntegrationId: integration.id, menuItemId },
    });
    return { success: true };
  }

  /**
   * Called by OrdersService — dispatches order to POS and logs the result.
   * Non-blocking: never throws (errors are logged only).
   */
  async dispatchOrderToPos(
    sellerId: string,
    orderId: string,
    menuItemId: string,
    buyerName: string,
    note: string | null,
  ): Promise<void> {
    const integration = await this.prisma.posIntegration.findUnique({
      where: { sellerId, isActive: true },
      include: {
        mappings: { where: { menuItemId, isEnabled: true } },
      },
    });

    if (!integration) return;

    const mapping = integration.mappings[0];
    if (!mapping) return; // item not mapped — skip silently

    const requestBody = {
      provider: integration.provider,
      externalItemId: mapping.externalId,
      externalPrice: mapping.externalPrice ? Number(mapping.externalPrice) : null,
      orderId,
      buyerName,
      note,
      timestamp: new Date().toISOString(),
    };

    let success = false;
    let statusCode: number | null = null;
    let responseBody: unknown = null;
    let errorMessage: string | null = null;
    let externalOrderId: string | null = null;

    try {
      const res = await fetch(integration.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${integration.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(8000),
      });

      statusCode = res.status;
      const text = await res.text();
      try { responseBody = JSON.parse(text); } catch { responseBody = text; }

      if (res.ok) {
        success = true;
        externalOrderId = (responseBody as any)?.id
          ?? (responseBody as any)?.orderId
          ?? (responseBody as any)?.external_id
          ?? null;
      } else {
        errorMessage = `POS returned ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err?.message ?? 'Network error';
    }

    // Persist log — fire and forget
    this.prisma.orderPosLog.create({
      data: {
        orderId,
        provider: integration.provider,
        externalOrderId,
        requestBody,
        responseBody: responseBody ?? {},
        statusCode,
        success,
        errorMessage,
      },
    }).catch(() => {});
  }

  private async ensureExists(sellerId: string) {
    const integration = await this.prisma.posIntegration.findUnique({ where: { sellerId } });
    if (!integration) throw new NotFoundException('No POS integration found');
    return integration;
  }
}
