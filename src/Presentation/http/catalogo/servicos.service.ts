import { Injectable } from '@nestjs/common';
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
import { AdicionarConsumoInsumoServicoDto } from './dto/adicionar-consumo-insumo-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { ListarServicosQueryDto } from './dto/listar-servicos-query.dto';

// ServicosService — camada de orquestração HTTP para o catálogo de serviços.
// Apenas traduz DTOs para os use-cases correspondentes da Application.
// Não contém regra de negócio e não acessa repositórios diretamente.
@Injectable()
export class ServicosService {
  constructor(
    private readonly criarServicoUseCase: CriarServicoUseCase,
    private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
    private readonly buscarServicoUseCase: BuscarServicoUseCase,
    private readonly listarServicosUseCase: ListarServicosUseCase,
    private readonly inativarServicoUseCase: InativarServicoUseCase,
    private readonly ativarServicoUseCase: AtivarServicoUseCase,
    private readonly adicionarConsumoInsumoServicoUseCase: AdicionarConsumoInsumoServicoUseCase,
    private readonly listarConsumosServicoUseCase: ListarConsumosServicoUseCase,
    private readonly removerConsumoInsumoServicoUseCase: RemoverConsumoInsumoServicoUseCase,
  ) {}

  async criar(dto: CriarServicoDto) {
    return this.criarServicoUseCase.execute({
      negocioId: dto.negocioId,
      nome: dto.nome,
      precoBase: dto.precoBase,
      descricao: dto.descricao,
      categoriaId: dto.categoriaId,
      duracaoEstimadaMinutos: dto.duracaoEstimadaMinutos,
      observacoes: dto.observacoes,
    });
  }

  async listar(query: ListarServicosQueryDto) {
    return this.listarServicosUseCase.execute({
      negocioId: query.negocioId,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
      ativo: query.ativo,
    });
  }

  async buscarPorId(negocioId: string, servicoId: string) {
    return this.buscarServicoUseCase.execute({
      negocioId,
      servicoId,
    });
  }

  async atualizar(servicoId: string, dto: AtualizarServicoDto) {
    await this.atualizarServicoUseCase.execute({
      negocioId: dto.negocioId,
      servicoId,
      nome: dto.nome,
      precoBase: dto.precoBase,
      descricao: dto.descricao,
      categoriaId: dto.categoriaId,
      duracaoEstimadaMinutos: dto.duracaoEstimadaMinutos,
      observacoes: dto.observacoes,
    });

    return this.buscarServicoUseCase.execute({
      negocioId: dto.negocioId,
      servicoId,
    });
  }

  async inativar(negocioId: string, servicoId: string) {
    await this.inativarServicoUseCase.execute({
      negocioId,
      servicoId,
    });
  }

  async ativar(negocioId: string, servicoId: string) {
    await this.ativarServicoUseCase.execute({
      negocioId,
      servicoId,
    });

    return this.buscarServicoUseCase.execute({
      negocioId,
      servicoId,
    });
  }

  async adicionarConsumo(servicoId: string, dto: AdicionarConsumoInsumoServicoDto) {
    return this.adicionarConsumoInsumoServicoUseCase.execute({
      negocioId: dto.negocioId,
      servicoId,
      produtoId: dto.produtoId,
      quantidade: dto.quantidade,
      unidadeMedida: dto.unidadeMedida,
    });
  }

  async listarConsumos(negocioId: string, servicoId: string) {
    return this.listarConsumosServicoUseCase.execute({
      negocioId,
      servicoId,
    });
  }

  async removerConsumo(negocioId: string, consumoId: string) {
    await this.removerConsumoInsumoServicoUseCase.execute({
      negocioId,
      consumoId,
    });
  }
}
