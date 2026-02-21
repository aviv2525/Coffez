import { Response } from 'express';

const COOKIE_NAME = 'refreshToken';
const MAX_AGE_DAYS = 7;

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge * 1000,
    path: '/',
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax' });
}
