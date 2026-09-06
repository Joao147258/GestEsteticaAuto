import { Module } from '@nestjs/common';
import {
  BuscarTituloReceberUseCase,
  CancelarTituloReceberUseCase,
  GerarTituloReceberUseCase,
  ListarTitulosReceberUseCase,
  RegistrarPagamentoUseCase,
} from '../../../Application/financeiro';
import { ComercialInfrastructureModule } from '../../../Infrastructure/database/prisma/comercial-infrastructure.module';
import { FinanceiroInfrastructureModule } from '../../../Infrastructure/database/prisma/financeiro-infrastructure.module';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';

// FinanceiroModule — módulo NestJS da camada Presentation para o Financeiro.
// Registra os controllers, services e use-cases de títulos a receber e pagamentos.
// Importa FinanceiroInfrastructureModule (TitulosReceberRepository) e ComercialInfrastructureModule (OrcamentosRepository).
@Module({
  imports: [
    FinanceiroInfrastructureModule,
    ComercialInfrastructureModule,
  ],
  controllers: [FinanceiroController],
  providers: [
    FinanceiroService,
    GerarTituloReceberUseCase,
    BuscarTituloReceberUseCase,
    ListarTitulosReceberUseCase,
    RegistrarPagamentoUseCase,
    CancelarTituloReceberUseCase,
  ],
  exports: [
    FinanceiroService,
    GerarTituloReceberUseCase,
    BuscarTituloReceberUseCase,
    ListarTitulosReceberUseCase,
    RegistrarPagamentoUseCase,
    CancelarTituloReceberUseCase,
  ],
})
export class FinanceiroModule {}
