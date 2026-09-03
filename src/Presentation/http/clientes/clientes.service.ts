import { Injectable } from '@nestjs/common';

import { CriarClienteUseCase } from '../../../Application/clientes/use-cases/criar-cliente.use-case';
import { AtualizarClienteUseCase } from '../../../Application/clientes/use-cases/atualizar-cliente.use-case';
import { BuscarClientePorIdUseCase } from '../../../Application/clientes/use-cases/buscar-cliente-por-id.use-case';
import { ListarClientesPorNegocioUseCase } from '../../../Application/clientes/use-cases/listar-clientes-por-negocio.use-case';
import { RemoverClienteUseCase } from '../../../Application/clientes/use-cases/remover-cliente.use-case';

import { CriarClienteDto } from './dto/criar-cliente.dto';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { ListarClientesQueryDto } from './dto/listar-clientes-query.dto';

// ClientesService — ponte entre o controller HTTP e os use cases da
// Application. É o intermediário que traduz o que chega da camada HTTP
// (DTOs) para o input que cada use case espera. NÃO contém regra de
// negócio: não valida, não cria entidade, não acessa Prisma — tudo isso
// já está encapsulado nos use cases / Domain.
@Injectable()
export class ClientesService {
  constructor(
    private readonly criarClienteUseCase: CriarClienteUseCase,
    private readonly atualizarClienteUseCase: AtualizarClienteUseCase,
    private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
    private readonly listarClientesPorNegocioUseCase: ListarClientesPorNegocioUseCase,
    private readonly removerClienteUseCase: RemoverClienteUseCase,
  ) {}

  // Cria um cliente. `tipo` entra aqui (obrigatório na criação) porque o
  // domínio exige TipoCliente para criar o Cliente.
  async criar(input: CriarClienteDto) {
    return this.criarClienteUseCase.execute({
      negocioId: input.negocioId,
      nome: input.nome,
      tipo: input.tipo,
      documento: input.documento,
      telefone: input.telefone,
      email: input.email,
    });
  }

  // Lista clientes do negócio. Repassa apenas os filtros que a Application
  // conhece (busca, pagina, limite) — a Presentation não inventa filtro.
  async listar(query: ListarClientesQueryDto) {
    return this.listarClientesPorNegocioUseCase.execute({
      negocioId: query.negocioId,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
    });
  }

  // Busca um cliente sempre no escopo do negócio (negocioId + clienteId),
  // evitando que um negócio acesse cliente de outro.
  async buscarPorId(negocioId: string, clienteId: string) {
    return this.buscarClientePorIdUseCase.execute({
      negocioId,
      clienteId,
    });
  }

  // Atualiza dados cadastrais. NÃO recebe `tipo`: regra de negócio — o tipo
  // é atribuído apenas na criação e nunca muda na edição (PF não vira PJ no
  // mesmo cadastro). AtualizarClienteInput, na Application, já segue isso.
  async atualizar(clienteId: string, input: AtualizarClienteDto) {
    return this.atualizarClienteUseCase.execute({
      negocioId: input.negocioId,
      clienteId,
      nome: input.nome,
      documento: input.documento,
      telefone: input.telefone,
      email: input.email,
    });
  }

  // Remove um cliente respeitando o escopo do negócio. O use case devolve
  // void; o controller decide o status HTTP (204 no padrão comercial).
  async remover(negocioId: string, clienteId: string) {
    await this.removerClienteUseCase.execute({
      negocioId,
      clienteId,
    });
  }
}
