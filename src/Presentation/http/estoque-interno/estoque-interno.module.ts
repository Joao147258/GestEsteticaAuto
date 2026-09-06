import { Module } from '@nestjs/common';
import { EstoqueInternoInfrastructureModule } from '../../../Infrastructure/database/prisma/estoque-interno-infrastructure.module';
import {
  AjustarQuantidadeEstoqueInternoUseCase,
  ConsultarSaldoEstoqueInternoUseCase,
  CriarItemEstoqueInternoUseCase,
  ListarMovimentacoesEstoqueInternoUseCase,
  RegistrarEntradaEstoqueInternoUseCase,
  RegistrarPerdaEstoqueInternoUseCase,
  RegistrarSaidaInternaEstoqueInternoUseCase,
} from '../../../Application/estoque_interno';
import { EstoqueInternoController } from './estoque-interno.controller';
import { EstoqueInternoService } from './estoque-interno.service';

// EstoqueInternoModule — módulo de Presentation HTTP para estoque interno de insumos.
// imports: EstoqueInternoInfrastructureModule provê o repositório PrismaEstoqueInternoRepository.
// controllers: Registra os endpoints REST sob /admin/estoque-interno.
// providers: EstoqueInternoService e os 7 use-cases de aplicação de estoque interno.
// exports: Disponibiliza EstoqueInternoService caso outros módulos precisem injetá-lo.
@Module({
  imports: [EstoqueInternoInfrastructureModule],
  controllers: [EstoqueInternoController],
  providers: [
    EstoqueInternoService,
    CriarItemEstoqueInternoUseCase,
    ConsultarSaldoEstoqueInternoUseCase,
    RegistrarEntradaEstoqueInternoUseCase,
    RegistrarSaidaInternaEstoqueInternoUseCase,
    RegistrarPerdaEstoqueInternoUseCase,
    AjustarQuantidadeEstoqueInternoUseCase,
    ListarMovimentacoesEstoqueInternoUseCase,
  ],
  exports: [EstoqueInternoService],
})
export class EstoqueInternoModule {}
