import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthInfrastructureModule } from '../../../Infrastructure/auth/auth-infrastructure.module';
import { UsuariosInfrastructureModule } from '../../../Infrastructure/database/prisma/usuarios-infrastructure.module';
import { LoginUseCase } from '../../../Application/auth/use-cases/login.use-case';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// AuthModule — camada HTTP de autenticação da V1.
// Registra o JwtAuthGuard como APP_GUARD global para proteger automaticamente
// todas as rotas da API, excetuando apenas as explicitamente anotadas com @Public().
@Module({
  imports: [AuthInfrastructureModule, UsuariosInfrastructureModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
