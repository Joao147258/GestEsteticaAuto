import { Injectable } from '@nestjs/common';
import {
  BuscarTituloReceberUseCase,
  CancelarTituloReceberUseCase,
  GerarTituloReceberUseCase,
  ListarTitulosReceberUseCase,
  RegistrarPagamentoUseCase,
} from '../../../Application/financeiro';
import { OrcamentosRepository } from '../../../Application/comercial/repositories/OrcamentosRepository';
import { NotFoundError } from '../../../Shared/errors/not-found.error';
import {
  GerarTituloReceberDto,
  ListarTitulosReceberQueryDto,
  RegistrarPagamentoDto,
} from './dto';

// FinanceiroService — camada de serviço HTTP do módulo financeiro.
// Orquestra as chamadas aos use-cases de geração de títulos, consulta, quitação de parcelas e cancelamento.
// Resolve automaticamente os dados do orçamento quando um orcamentoId for fornecido.
@Injectable()
export class FinanceiroService {
  constructor(
    private readonly gerarTituloReceberUseCase: GerarTituloReceberUseCase,
    private readonly buscarTituloReceberUseCase: BuscarTituloReceberUseCase,
    private readonly listarTitulosReceberUseCase: ListarTitulosReceberUseCase,
    private readonly registrarPagamentoUseCase: RegistrarPagamentoUseCase,
    private readonly cancelarTituloReceberUseCase: CancelarTituloReceberUseCase,
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  // Gera um título a receber. Se o orcamentoId for informado, busca o orçamento para preencher
  // clienteId, valor original e parcelamento padrão (caso não customizado no payload).
  async gerar(dto: GerarTituloReceberDto) {
    let origem = (dto.origem as any) || 'ORCAMENTO';
    let origemId = dto.origemId || dto.orcamentoId || '';
    let clienteId = dto.clienteId || '';
    let descricao = dto.descricao || '';
    let valorOriginal = dto.valorOriginal ?? 0;
    let parcelas = dto.parcelas;

    // Quando gerado a partir de um orçamento aprovado, herda dados do orçamento caso omitidos
    if (dto.orcamentoId) {
      origem = 'ORCAMENTO';
      origemId = dto.orcamentoId;

      const orcamento = await this.orcamentosRepository.buscarPorId(
        dto.negocioId,
        dto.orcamentoId,
      );

      if (!orcamento) {
        throw new NotFoundError('Orçamento não encontrado.');
      }

      if (!clienteId) {
        clienteId = orcamento.clienteId;
      }
      if (!descricao) {
        descricao = orcamento.observacoes || `Faturamento Orçamento #${orcamento.id}`;
      }
      if (valorOriginal <= 0) {
        valorOriginal = orcamento.valorTotal;
      }
    }

    // Caso o payload não tenha discriminado parcelas, gera 1 parcela à vista com o valor total
    const parcelasMapeadas =
      parcelas && parcelas.length > 0
        ? parcelas.map((p, index) => ({
            numero: p.numero ?? index + 1,
            tipo: (p.tipo as any) || 'PARCELA',
            descricao: p.descricao,
            valorOriginal: p.valor,
            dataVencimento: new Date(p.dataVencimento),
          }))
        : [
            {
              numero: 1,
              tipo: 'PARCELA' as const,
              descricao: 'Parcela única',
              valorOriginal,
              dataVencimento: dto.dataVencimento
                ? new Date(dto.dataVencimento)
                : new Date(),
            },
          ];

    return this.gerarTituloReceberUseCase.execute({
      negocioId: dto.negocioId,
      origem,
      origemId,
      clienteId,
      descricao,
      valorOriginal,
      valorDesconto: dto.valorDesconto,
      valorAcrescimo: dto.valorAcrescimo,
      dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
      parcelas: parcelasMapeadas,
      observacoes: dto.observacoes,
    });
  }

  // Busca detalhe do título financeiro por ID com suas parcelas e histórico.
  async buscarPorId(negocioId: string, tituloId: string) {
    return this.buscarTituloReceberUseCase.execute({ negocioId, tituloId });
  }

  // Lista títulos a receber com base nos filtros multi-tenant.
  async listar(query: ListarTitulosReceberQueryDto) {
    return this.listarTitulosReceberUseCase.execute({
      negocioId: query.negocioId,
      clienteId: query.clienteId,
      origem: query.origem as any,
      origemId: query.origemId,
      status: query.status as any,
      dataVencimentoInicio: query.dataVencimentoInicio
        ? new Date(query.dataVencimentoInicio)
        : undefined,
      dataVencimentoFim: query.dataVencimentoFim
        ? new Date(query.dataVencimentoFim)
        : undefined,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
    });
  }

  // Registra quitação (parcial ou integral) de uma parcela do título a receber.
  async registrarPagamento(
    negocioId: string,
    tituloId: string,
    dto: RegistrarPagamentoDto,
  ) {
    return this.registrarPagamentoUseCase.execute({
      negocioId,
      tituloId,
      parcelaFinanceiraId: dto.parcelaId,
      valor: dto.valorPago,
      formaPagamentoId: dto.formaPagamentoId || 'PADRAO',
      formaPagamentoDescricao: dto.formaPagamento || 'Forma Padrão',
      dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : undefined,
      observacao: dto.observacoes,
    });
  }

  // Cancela um título financeiro em aberto registrando o motivo auditável.
  async cancelar(negocioId: string, tituloId: string, motivo: string) {
    return this.cancelarTituloReceberUseCase.execute({
      negocioId,
      tituloId,
      motivo,
    });
  }
}
