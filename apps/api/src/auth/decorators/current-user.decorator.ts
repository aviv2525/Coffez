import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | unknown => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as CurrentUserPayload;
    return data ? user?.[data] : user;
  },
);
