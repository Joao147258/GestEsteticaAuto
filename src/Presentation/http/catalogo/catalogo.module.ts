import { Module } from '@nestjs/common';
import { CatalogoInfrastructureModule } from '../../../Infrastructure/database/prisma/catalogo-infrastructure.module';
import {
  AdicionarConsumoInsumoServicoUseCase,
  AtivarServicoUseCase,
  AtualizarServicoUseCase,
  BuscarServicoUseCase,
  CriarServicoUseCase,
  InativarServicoUseCase,
  ListarConsumosServicoUseCase,
  ListarServicosUseCase,
  RemoverConsumoInsumoServicoUseCase,
} from '../../../Application/catalogo';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';

// CatalogoModule — camada HTTP do módulo de catálogo de serviços.
// imports: CatalogoInfrastructureModule registra os repositórios Prisma
// (ServicosRepository, ProdutosRepository, ConsumosInsumoServicoRepository).
// providers: ServicosService + todos os use-cases necessários.
@Module({
  imports: [CatalogoInfrastructureModule],
  controllers: [ServicosController],
  providers: [
    ServicosService,
    CriarServicoUseCase,
    AtualizarServicoUseCase,
    BuscarServicoUseCase,
    ListarServicosUseCase,
    InativarServicoUseCase,
    AtivarServicoUseCase,
    AdicionarConsumoInsumoServicoUseCase,
    ListarConsumosServicoUseCase,
    RemoverConsumoInsumoServicoUseCase,
  ],
  exports: [ServicosService],
})
export class CatalogoModule {}
