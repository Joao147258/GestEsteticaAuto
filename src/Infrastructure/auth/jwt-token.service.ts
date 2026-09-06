import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  TokenPayload,
  TokenService,
} from '../../Application/auth/services/token.service';
import { UnauthorizedError } from '../../Shared/errors/unauthorized.error';

// JwtTokenService — implementação concreta de geração e verificação de JWTs com jsonwebtoken.
// Permite extrair o segredo de ambiente (JWT_SECRET) e assina com expiração de 7 dias na V1.
@Injectable()
export class JwtTokenService implements TokenService {
  private readonly secret: string;

  constructor(configService?: ConfigService) {
    this.secret =
      configService?.get<string>('JWT_SECRET') ||
      process.env.JWT_SECRET ||
      'gestcorp-auto-secret-jwt-key-default-v1';
  }

  async gerarToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secret, {
      expiresIn: '7d',
    });
  }

  async verificarToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Token de autenticação inválido ou expirado.');
    }
  }
}
