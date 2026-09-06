import { Module } from '@nestjs/common';
import { CatalogoInfrastructureModule } from '../../../Infrastructure/database/prisma/catalogo-infrastructure.module';
import { EstoqueInternoInfrastructureModule } from '../../../Infrastructure/database/prisma/estoque-interno-infrastructure.module';
import { OperacaoInfrastructureModule } from '../../../Infrastructure/database/prisma/operacao-infrastructure.module';
import {
  CalcularConsumoInsumosItemOSUseCase,
  ConfirmarConsumoInsumosItemOSUseCase,
} from '../../../Application/operacao';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';

// OperacaoModule — camada HTTP e de injeção de dependências do módulo de Operação.
// imports: Registra as infraestruturas Prisma necessárias para ordens de serviço,
// fichas técnicas de serviços/produtos (Catalogo) e controle de saldo/movimentação (EstoqueInterno).
// providers: OrdensServicoService e os use-cases de cálculo e confirmação de consumo.
@Module({
  imports: [
    OperacaoInfrastructureModule,
    CatalogoInfrastructureModule,
    EstoqueInternoInfrastructureModule,
  ],
  controllers: [OrdensServicoController],
  providers: [
    OrdensServicoService,
    CalcularConsumoInsumosItemOSUseCase,
    ConfirmarConsumoInsumosItemOSUseCase,
  ],
  exports: [OrdensServicoService],
})
export class OperacaoModule {}
