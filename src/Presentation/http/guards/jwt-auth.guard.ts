import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TokenService } from '../../../Application/auth/services/token.service';
import { UnauthorizedError } from '../../../Shared/errors/unauthorized.error';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// JwtAuthGuard — guard de autenticação por token JWT.
// 1. Permite rotas marcadas com @Public() sem autenticação.
// 2. Extrai e valida o token Bearer no cabeçalho Authorization.
// 3. Popula request.user com os dados do usuário e tenant (negocioId).
// 4. Suporta modo de compatibilidade (Fase 1) para rotas administrativas com negocioId explícito.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedError('Token de autenticação ausente.');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Formato do token de autenticação inválido. Utilize Bearer <token>.');
    }

    const payload = await this.tokenService.verificarToken(token);
    const nomeUsuario = payload.username || (payload.email?.includes('@')
      ? payload.email.split('@')[0]
      : payload.email);
    const papelUsuario = payload.role || payload.papel || 'ADMIN';

    request.user = {
      id: payload.sub,
      negocioId: payload.negocioId,
      nome: payload.nome,
      email: payload.email,
      username: nomeUsuario,
      usuario: nomeUsuario,
      role: papelUsuario,
      papel: papelUsuario,
    };

    return true;
  }
}
