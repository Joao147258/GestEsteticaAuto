import { Module } from '@nestjs/common';
import { DashboardQueryRepository } from '../../../Application/dashboard/queries/dashboard-query.repository';
import { PrismaModule } from './prisma.module';
import { PrismaDashboardQueryRepository } from './queries/prisma-dashboard-query.repository';

// DashboardInfrastructureModule — registra o repositório Prisma de queries para o Dashboard.
// Provê a injeção do DashboardQueryRepository nos use-cases e na camada Presentation.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: DashboardQueryRepository,
      useClass: PrismaDashboardQueryRepository,
    },
  ],
  exports: [DashboardQueryRepository],
})
export class DashboardInfrastructureModule {}
