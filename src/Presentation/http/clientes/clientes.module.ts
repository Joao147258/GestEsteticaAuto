import { Module } from '@nestjs/common';

import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

import { ClientesInfrastructureModule } from '../../../Infrastructure/database/prisma/clientes-infrastructure.module';

import { CriarClienteUseCase } from '../../../Application/clientes/use-cases/criar-cliente.use-case';
import { AtualizarClienteUseCase } from '../../../Application/clientes/use-cases/atualizar-cliente.use-case';
import { BuscarClientePorIdUseCase } from '../../../Application/clientes/use-cases/buscar-cliente-por-id.use-case';
import { ListarClientesPorNegocioUseCase } from '../../../Application/clientes/use-cases/listar-clientes-por-negocio.use-case';
import { RemoverClienteUseCase } from '../../../Application/clientes/use-cases/remover-cliente.use-case';

// ClientesModule — camada HTTP do módulo de clientes, usando o padrão de
// service intermediário (ClientesService orquestra os use cases; o controller
// só traduz HTTP → service).
//
// imports: ClientesInfrastructureModule registra o token abstrato
// ClientesRepository → PrismaClientesRepository. Sem ele, o Nest não resolve
// as dependências dos use cases (erro clássico "Nest can't resolve
// dependencies of CriarClienteUseCase" — o erro 500 histórico do projeto).
//
// providers: ClientesService (que o controller injeta) + cada use case que o
// service depende. Todos precisam ser providers para o Nest injetá-los.
@Module({
  imports: [ClientesInfrastructureModule],
  controllers: [ClientesController],
  providers: [
    ClientesService,
    CriarClienteUseCase,
    AtualizarClienteUseCase,
    BuscarClientePorIdUseCase,
    ListarClientesPorNegocioUseCase,
    RemoverClienteUseCase,
  ],
})
export class ClientesModule {}
