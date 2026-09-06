import { Module } from '@nestjs/common';
import { HashService } from '../../Application/auth/services/hash.service';
import { TokenService } from '../../Application/auth/services/token.service';
import { BcryptHashService } from './bcrypt-hash.service';
import { JwtTokenService } from './jwt-token.service';

// AuthInfrastructureModule — provê implementações concretas para HashService e TokenService.
// Exporta os contratos abstratos para que a Application e Presentation possam consumi-los.
@Module({
  providers: [
    {
      provide: HashService,
      useClass: BcryptHashService,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [HashService, TokenService],
})
export class AuthInfrastructureModule {}
