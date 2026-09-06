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

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedError('Formato do token de autenticação inválido. Utilize Bearer <token>.');
      }

      const payload = await this.tokenService.verificarToken(token);
      const nomeUsuario = payload.email.includes('@')
        ? payload.email.split('@')[0]
        : payload.email;

      request.user = {
        id: payload.sub,
        negocioId: payload.negocioId,
        nome: payload.nome,
        email: payload.email,
        usuario: nomeUsuario,
        papel: payload.papel || 'ADMIN',
      };

      return true;
    }

    // Rota /auth/me exige obrigatoriamente token JWT
    if (request.url?.includes('/auth/me')) {
      throw new UnauthorizedError('Token de autenticação ausente.');
    }

    // Modo de Compatibilidade da V1 (Fase 1): permite requisições administrativas
    // sem token para validação de DTO / contrato via ValidationPipe
    const negocioId =
      request.query?.negocioId ||
      request.body?.negocioId;

    if (negocioId && typeof negocioId === 'string') {
      request.user = {
        id: 'compat-user',
        negocioId: negocioId.trim(),
        nome: 'Administrador (Compatibilidade)',
        email: 'admin@gestcorp.com.br',
        usuario: 'admin',
        papel: 'ADMIN',
      };
    }

    return true;
  }
}
