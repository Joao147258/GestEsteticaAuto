import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  TokenPayload,
  TokenService,
} from '../../Application/auth/services/token.service';
import { UnauthorizedError } from '../../Shared/errors/unauthorized.error';

// JwtTokenService — implementação concreta de geração e verificação de JWTs com jsonwebtoken.
// Requer JWT_SECRET obrigatório no ambiente e suporta expiração configurável via JWT_EXPIRES_IN (default: 1d).
@Injectable()
export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(configService?: ConfigService) {
    const secret =
      configService?.get<string>('JWT_SECRET') || process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET não está configurado no ambiente. Defina a variável JWT_SECRET no arquivo .env.',
      );
    }

    this.secret = secret;
    this.expiresIn =
      configService?.get<string>('JWT_EXPIRES_IN') ||
      process.env.JWT_EXPIRES_IN ||
      '1d';
  }

  async gerarToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
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

