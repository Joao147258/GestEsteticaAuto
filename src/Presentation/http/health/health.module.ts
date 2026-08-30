import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../Infrastructure/database/prisma/prisma.module';
import { HealthController } from './health.controller';

// HealthModule — registra o endpoint GET /health.
// Importa o PrismaModule da Infrastructure para obter o PrismaService
// (que também é usado pelos módulos de persistência, sem duplicidade).
@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
