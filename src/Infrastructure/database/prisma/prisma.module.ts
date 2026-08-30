import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// PrismaModule — ponto único de acesso ao PrismaService da aplicação.
// A camada de Infrastructure NÃO expõe controller HTTP: o endpoint de
// health/status é responsabilidade da Presentation (GET /health).
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
