import { Module } from '@nestjs/common';
import {
  ObterResumoComercialUseCase,
  ObterResumoFinanceiroUseCase,
  ObterResumoGeralUseCase,
  ObterResumoOperacionalUseCase,
} from '../../../Application/dashboard';
import { DashboardInfrastructureModule } from '../../../Infrastructure/database/prisma/dashboard-infrastructure.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// DashboardModule — módulo da camada de apresentação para métricas analíticas e painéis de gestão.
// Importa o DashboardInfrastructureModule para prover a consulta ao banco de dados via Prisma.
@Module({
  imports: [DashboardInfrastructureModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    ObterResumoGeralUseCase,
    ObterResumoComercialUseCase,
    ObterResumoOperacionalUseCase,
    ObterResumoFinanceiroUseCase,
  ],
  exports: [
    DashboardService,
    ObterResumoGeralUseCase,
    ObterResumoComercialUseCase,
    ObterResumoOperacionalUseCase,
    ObterResumoFinanceiroUseCase,
  ],
})
export class DashboardModule {}
