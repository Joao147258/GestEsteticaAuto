import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../Shared/types/usuario-autenticado.type';

// Decorator @CurrentUser() — injeta o usuário autenticado extraído do JWT pelo JwtAuthGuard.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
