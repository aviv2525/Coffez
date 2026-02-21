import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) throw new UnauthorizedException('Refresh token required');
    (req as any).refreshToken = token;
    return true;
  }
}
