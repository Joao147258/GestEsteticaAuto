import { Module } from '@nestjs/common';
import {
  AtualizarOrdemServicoUseCase,
  BuscarOrdemServicoUseCase,
  CalcularConsumoInsumosItemOSUseCase,
  CancelarOrdemServicoUseCase,
  ConcluirOrdemServicoUseCase,
  ConfirmarConsumoInsumosItemOSUseCase,
  EntregarOrdemServicoUseCase,
  GerarOrdemServicoUseCase,
  IniciarOrdemServicoUseCase,
  ListarOrdensServicoUseCase,
  PausarOrdemServicoUseCase,
} from '../../../Application/operacao';
import { CatalogoInfrastructureModule } from '../../../Infrastructure/database/prisma/catalogo-infrastructure.module';
import { ComercialInfrastructureModule } from '../../../Infrastructure/database/prisma/comercial-infrastructure.module';
import { EstoqueInternoInfrastructureModule } from '../../../Infrastructure/database/prisma/estoque-interno-infrastructure.module';
import { OperacaoInfrastructureModule } from '../../../Infrastructure/database/prisma/operacao-infrastructure.module';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';

// OperacaoModule — camada HTTP e de injeção de dependências do módulo de Operação.
// imports:
// - OperacaoInfrastructureModule: provê OrdensServicoRepository
// - ComercialInfrastructureModule: provê OrcamentosRepository (necessário para GerarOrdemServicoUseCase)
// - CatalogoInfrastructureModule: provê ServicosRepository (fichas técnicas)
// - EstoqueInternoInfrastructureModule: provê ItensEstoqueInternoRepository e MovimentacoesEstoqueInternoRepository
// providers:
// - OrdensServicoService e todos os use-cases de ciclo de vida e consumo de insumos da OS.
@Module({
  imports: [
    OperacaoInfrastructureModule,
    ComercialInfrastructureModule,
    CatalogoInfrastructureModule,
    EstoqueInternoInfrastructureModule,
  ],
  controllers: [OrdensServicoController],
  providers: [
    OrdensServicoService,
    GerarOrdemServicoUseCase,
    BuscarOrdemServicoUseCase,
    ListarOrdensServicoUseCase,
    AtualizarOrdemServicoUseCase,
    IniciarOrdemServicoUseCase,
    PausarOrdemServicoUseCase,
    ConcluirOrdemServicoUseCase,
    EntregarOrdemServicoUseCase,
    CancelarOrdemServicoUseCase,
    CalcularConsumoInsumosItemOSUseCase,
    ConfirmarConsumoInsumosItemOSUseCase,
  ],
  exports: [
    OrdensServicoService,
    GerarOrdemServicoUseCase,
    BuscarOrdemServicoUseCase,
    ListarOrdensServicoUseCase,
    AtualizarOrdemServicoUseCase,
    IniciarOrdemServicoUseCase,
    PausarOrdemServicoUseCase,
    ConcluirOrdemServicoUseCase,
    EntregarOrdemServicoUseCase,
    CancelarOrdemServicoUseCase,
    CalcularConsumoInsumosItemOSUseCase,
    ConfirmarConsumoInsumosItemOSUseCase,
  ],
})
export class OperacaoModule {}
