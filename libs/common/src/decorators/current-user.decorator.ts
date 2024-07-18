import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'apps/user/src/users/models/user.schema';

const getCurrentUserByContex = (ctx: ExecutionContext): UserDocument => {
  return ctx.switchToHttp().getRequest().user;
};
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getCurrentUserByContex(ctx),
);
