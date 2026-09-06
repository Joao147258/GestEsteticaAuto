import { Injectable } from '@nestjs/common';
import {
  AjustarQuantidadeEstoqueInternoUseCase,
  ConsultarSaldoEstoqueInternoUseCase,
  CriarItemEstoqueInternoUseCase,
  ListarMovimentacoesEstoqueInternoUseCase,
  RegistrarEntradaEstoqueInternoUseCase,
  RegistrarPerdaEstoqueInternoUseCase,
  RegistrarSaidaInternaEstoqueInternoUseCase,
} from '../../../Application/estoque_interno';
import { AjustarQuantidadeEstoqueInternoDto } from './dto/ajustar-quantidade-estoque-interno.dto';
import { CriarItemEstoqueInternoDto } from './dto/criar-item-estoque-interno.dto';
import { ListarMovimentacoesEstoqueInternoQueryDto } from './dto/listar-movimentacoes-estoque-interno-query.dto';
import { RegistrarEntradaEstoqueInternoDto } from './dto/registrar-entrada-estoque-interno.dto';
import { RegistrarPerdaEstoqueInternoDto } from './dto/registrar-perda-estoque-interno.dto';
import { RegistrarSaidaInternaEstoqueInternoDto } from './dto/registrar-saida-interna-estoque-interno.dto';

// EstoqueInternoService — orquestrador HTTP para a gestão de estoque interno de insumos.
// Traduz os DTOs para os use-cases da Application sem acoplamento a regras de domínio.
@Injectable()
export class EstoqueInternoService {
  constructor(
    private readonly criarItemUseCase: CriarItemEstoqueInternoUseCase,
    private readonly consultarSaldoUseCase: ConsultarSaldoEstoqueInternoUseCase,
    private readonly registrarEntradaUseCase: RegistrarEntradaEstoqueInternoUseCase,
    private readonly registrarSaidaInternaUseCase: RegistrarSaidaInternaEstoqueInternoUseCase,
    private readonly registrarPerdaUseCase: RegistrarPerdaEstoqueInternoUseCase,
    private readonly ajustarQuantidadeUseCase: AjustarQuantidadeEstoqueInternoUseCase,
    private readonly listarMovimentacoesUseCase: ListarMovimentacoesEstoqueInternoUseCase,
  ) {}

  async criarItem(dto: CriarItemEstoqueInternoDto) {
    return this.criarItemUseCase.execute({
      negocioId: dto.negocioId,
      produtoId: dto.produtoId,
      unidadeMedida: dto.unidadeMedida,
      quantidadeInicial: dto.quantidadeAtual ?? dto.quantidadeInicial ?? 0,
      custoUnitarioAproximado: dto.custoUnitarioAproximado,
      estoqueMinimo: dto.estoqueMinimo,
      observacoes: dto.observacoes,
    });
  }

  async consultarSaldo(negocioId: string, produtoId: string) {
    return this.consultarSaldoUseCase.execute({
      negocioId,
      produtoId,
    });
  }

  async registrarEntrada(produtoId: string, dto: RegistrarEntradaEstoqueInternoDto) {
    return this.registrarEntradaUseCase.execute({
      negocioId: dto.negocioId,
      produtoId,
      quantidade: dto.quantidade,
      motivo: dto.motivo,
    });
  }

  async registrarSaidaInterna(produtoId: string, dto: RegistrarSaidaInternaEstoqueInternoDto) {
    return this.registrarSaidaInternaUseCase.execute({
      negocioId: dto.negocioId,
      produtoId,
      quantidade: dto.quantidade,
      motivo: dto.motivo,
      referenciaId: dto.referenciaId,
      referenciaTipo: dto.referenciaTipo,
      referenciaItemId: dto.referenciaItemId,
    });
  }

  async registrarPerda(produtoId: string, dto: RegistrarPerdaEstoqueInternoDto) {
    return this.registrarPerdaUseCase.execute({
      negocioId: dto.negocioId,
      produtoId,
      quantidade: dto.quantidade,
      motivo: dto.motivo,
    });
  }

  async ajustarQuantidade(produtoId: string, dto: AjustarQuantidadeEstoqueInternoDto) {
    return this.ajustarQuantidadeUseCase.execute({
      negocioId: dto.negocioId,
      produtoId,
      novaQuantidade: dto.novaQuantidade,
      motivo: dto.motivo,
    });
  }

  async listarMovimentacoes(produtoId: string, query: ListarMovimentacoesEstoqueInternoQueryDto) {
    return this.listarMovimentacoesUseCase.execute({
      negocioId: query.negocioId,
      produtoId,
    });
  }
}
