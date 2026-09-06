import { Module } from '@nestjs/common';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';
import { VeiculosInfrastructureModule } from '../../../Infrastructure/database/prisma/veiculos-infrastructure.module';
import { ClientesInfrastructureModule } from '../../../Infrastructure/database/prisma/clientes-infrastructure.module';
import {
  CriarVeiculoUseCase,
  AtualizarVeiculoUseCase,
  BuscarVeiculoUseCase,
  ListarVeiculosUseCase,
  RemoverVeiculoUseCase,
} from '../../../Application/veiculos';

// VeiculosModule — camada HTTP do módulo de veículos.
// imports: VeiculosInfrastructureModule registra VeiculosRepository
// e ClientesInfrastructureModule registra ClientesRepository (necessário para CriarVeiculoUseCase).
// providers: VeiculosService + use cases da Application.
@Module({
  imports: [
    VeiculosInfrastructureModule,
    ClientesInfrastructureModule,
  ],
  controllers: [VeiculosController],
  providers: [
    VeiculosService,
    CriarVeiculoUseCase,
    AtualizarVeiculoUseCase,
    BuscarVeiculoUseCase,
    ListarVeiculosUseCase,
    RemoverVeiculoUseCase,
  ],
  exports: [VeiculosService],
})
export class VeiculosModule {}
