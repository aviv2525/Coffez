import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from './cookie.util';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    if (result.refreshToken && result.expiresAt) {
      setRefreshTokenCookie(res, result.refreshToken, result.expiresAt);
      return { user: result.user, accessToken: result.accessToken, expiresAt: result.expiresAt };
    }
    return result;
  }

  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 600000 } }) // 5 attempts per 10 min
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.auth.login(dto, refreshToken);
    setRefreshTokenCookie(res, result.refreshToken, result.expiresAt);
    return { user: result.user, accessToken: result.accessToken, expiresAt: result.expiresAt };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).refreshToken as string;
    const result = await this.auth.refresh(refreshToken);
    setRefreshTokenCookie(res, result.refreshToken, result.expiresAt);
    return { accessToken: result.accessToken, expiresAt: result.expiresAt };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).refreshToken as string;
    await this.auth.logout(refreshToken);
    clearRefreshTokenCookie(res);
    return { success: true };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto);
  }

  @Post('password/reset-request')
  @ApiOperation({ summary: 'Request password reset email' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
}
