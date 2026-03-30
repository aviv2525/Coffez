import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const get = (k: string, d = '') => config?.get?.(k) ?? process.env[k] ?? d;
    super({
      clientID: get('GOOGLE_CLIENT_ID', 'not-configured'),
      clientSecret: get('GOOGLE_CLIENT_SECRET', 'not-configured'),
      callbackURL: `${get('API_URL', 'http://localhost:4000')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), false);
    done(null, {
      googleId: profile.id,
      email,
      name: profile.displayName || email.split('@')[0],
    });
  }
}
