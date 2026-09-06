import { Injectable } from '@nestjs/common';
import {
  ConsultarMetricasInput,
  DashboardQueryRepository,
  MetricasComerciais,
  MetricasFinanceiras,
  MetricasGerais,
  MetricasOperacionais,
} from '../../../../Application/dashboard/queries/dashboard-query.repository';
import { PrismaService } from '../prisma.service';

// PrismaDashboardQueryRepository — implementação em PostgreSQL/Prisma para os indicadores do Dashboard.
// Utiliza agregados de alta performance (groupBy, aggregate) com filtro multi-tenant obrigatório por negocioId.
@Injectable()
export class PrismaDashboardQueryRepository implements DashboardQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Consulta indicadores comerciais: distribuição de orçamentos por status, valor em negociação e aprovado no mês.
  async obterMetricasComerciais(
    input: ConsultarMetricasInput,
  ): Promise<MetricasComerciais> {
    const where: Record<string, any> = { negocioId: input.negocioId };
    if (input.dataInicio || input.dataFim) {
      where.criadoEm = {};
      if (input.dataInicio) where.criadoEm.gte = input.dataInicio;
      if (input.dataFim) where.criadoEm.lte = input.dataFim;
    }

    const gruposStatus = await this.prisma.orcamento.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    });

    const statusMap: Record<string, number> = {
      EM_ABERTO: 0,
      RASCUNHO: 0,
      ACEITO: 0,
      CANCELADO: 0,
    };
    let totalOrcamentos = 0;

    for (const g of gruposStatus) {
      statusMap[g.status] = g._count._all;
      totalOrcamentos += g._count._all;
    }

    // Valor total em negociação (soma de orçamentos com status EM_ABERTO)
    const aggNegociacao = await this.prisma.orcamento.aggregate({
      _sum: { valorTotal: true },
      where: {
        ...where,
        status: 'EM_ABERTO',
      },
    });
    const valorEmNegociacao = Number(aggNegociacao._sum?.valorTotal ?? 0);

    // Valor aprovado no mês corrente
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);

    const aggAprovadoMes = await this.prisma.orcamento.aggregate({
      _sum: { valorTotal: true },
      where: {
        negocioId: input.negocioId,
        status: 'ACEITO',
        atualizadoEm: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    });
    const valorAprovadoMes = Number(aggAprovadoMes._sum?.valorTotal ?? 0);

    return {
      orcamentosPorStatus: {
        EM_ABERTO: statusMap['EM_ABERTO'] ?? 0,
        RASCUNHO: statusMap['RASCUNHO'] ?? 0,
        ACEITO: statusMap['ACEITO'] ?? 0,
        CANCELADO: statusMap['CANCELADO'] ?? 0,
        ...statusMap,
      },
      valorEmNegociacao: Number(valorEmNegociacao.toFixed(2)),
      valorAprovadoMes: Number(valorAprovadoMes.toFixed(2)),
      totalOrcamentos,
    };
  }

  // Consulta indicadores operacionais: quantidade de Ordens de Serviço por cada um dos 7 status do ciclo de vida.
  async obterMetricasOperacionais(
    input: ConsultarMetricasInput,
  ): Promise<MetricasOperacionais> {
    const where: Record<string, any> = { negocioId: input.negocioId };
    if (input.dataInicio || input.dataFim) {
      where.abertaEm = {};
      if (input.dataInicio) where.abertaEm.gte = input.dataInicio;
      if (input.dataFim) where.abertaEm.lte = input.dataFim;
    }

    const gruposStatus = await this.prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    });

    const statusMap: Record<string, number> = {
      ABERTA: 0,
      AGUARDANDO_VEICULO: 0,
      EM_EXECUCAO: 0,
      PAUSADA: 0,
      CONCLUIDA: 0,
      ENTREGUE: 0,
      CANCELADA: 0,
    };
    let totalOrdens = 0;

    for (const g of gruposStatus) {
      statusMap[g.status] = g._count._all;
      totalOrdens += g._count._all;
    }

    return {
      ordensPorStatus: {
        ABERTA: statusMap['ABERTA'] ?? 0,
        AGUARDANDO_VEICULO: statusMap['AGUARDANDO_VEICULO'] ?? 0,
        EM_EXECUCAO: statusMap['EM_EXECUCAO'] ?? 0,
        PAUSADA: statusMap['PAUSADA'] ?? 0,
        CONCLUIDA: statusMap['CONCLUIDA'] ?? 0,
        ENTREGUE: statusMap['ENTREGUE'] ?? 0,
        CANCELADA: statusMap['CANCELADA'] ?? 0,
        ...statusMap,
      },
      totalOrdens,
    };
  }

  // Consulta indicadores financeiros: total a receber pendente, total vencido e total recebido no mês.
  async obterMetricasFinanceiras(
    input: ConsultarMetricasInput,
  ): Promise<MetricasFinanceiras> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);

    // Contagem de títulos por status
    const gruposStatus = await this.prisma.titulo.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { negocioId: input.negocioId },
    });

    const titulosPorStatus: Record<string, number> = {
      ABERTO: 0,
      PARCIALMENTE_PAGO: 0,
      PAGO: 0,
      CANCELADO: 0,
    };
    for (const g of gruposStatus) {
      titulosPorStatus[g.status] = g._count._all;
    }

    // Busca títulos em aberto para calcular saldo pendente e vencido
    const titulosEmAberto = await this.prisma.titulo.findMany({
      where: {
        negocioId: input.negocioId,
        status: { in: ['ABERTO', 'PARCIALMENTE_PAGO'] },
      },
      include: {
        parcelas: {
          include: {
            pagamentos: true,
          },
        },
      },
    });

    let totalAReceber = 0;
    let totalVencido = 0;

    for (const titulo of titulosEmAberto) {
      const valorTotal =
        Number(titulo.valorOriginal) -
        Number(titulo.valorDesconto) +
        Number(titulo.valorAcrescimo);

      let totalPagoTitulo = 0;
      for (const parcela of titulo.parcelas) {
        for (const pg of parcela.pagamentos) {
          if (pg.status === 'CONFIRMADO') {
            totalPagoTitulo += Number(pg.valor);
          }
        }
      }

      const saldoAbertoTitulo = Math.max(0, valorTotal - totalPagoTitulo);
      totalAReceber += saldoAbertoTitulo;

      // Se a data de vencimento expirou e ainda há saldo, soma ao total vencido
      if (titulo.dataVencimento && new Date(titulo.dataVencimento) < agora) {
        totalVencido += saldoAbertoTitulo;
      }
    }

    // Total recebido no mês corrente (pagamentos confirmados)
    const aggPagamentosMes = await this.prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: {
        negocioId: input.negocioId,
        status: 'CONFIRMADO',
        dataPagamento: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    });
    const totalRecebidoMes = Number(aggPagamentosMes._sum?.valor ?? 0);

    return {
      totalAReceber: Number(totalAReceber.toFixed(2)),
      totalVencido: Number(totalVencido.toFixed(2)),
      totalRecebidoMes: Number(totalRecebidoMes.toFixed(2)),
      titulosPorStatus: {
        ABERTO: titulosPorStatus['ABERTO'] ?? 0,
        PARCIALMENTE_PAGO: titulosPorStatus['PARCIALMENTE_PAGO'] ?? 0,
        PAGO: titulosPorStatus['PAGO'] ?? 0,
        CANCELADO: titulosPorStatus['CANCELADO'] ?? 0,
        ...titulosPorStatus,
      },
    };
  }

  // Consolidação geral para carga instantânea dos cards principais da tela inicial (Dashboard Home).
  async obterMetricasGerais(input: ConsultarMetricasInput): Promise<MetricasGerais> {
    const [comercial, operacional, financeiro] = await Promise.all([
      this.obterMetricasComerciais(input),
      this.obterMetricasOperacionais(input),
      this.obterMetricasFinanceiras(input),
    ]);

    const totalOrdensAtivas =
      (operacional.ordensPorStatus['ABERTA'] ?? 0) +
      (operacional.ordensPorStatus['AGUARDANDO_VEICULO'] ?? 0) +
      (operacional.ordensPorStatus['EM_EXECUCAO'] ?? 0) +
      (operacional.ordensPorStatus['PAUSADA'] ?? 0);

    return {
      comercial: {
        orcamentosEmAberto: comercial.orcamentosPorStatus['EM_ABERTO'] ?? 0,
        valorEmNegociacao: comercial.valorEmNegociacao,
        valorAprovadoMes: comercial.valorAprovadoMes,
      },
      operacional: {
        ordensEmExecucao: operacional.ordensPorStatus['EM_EXECUCAO'] ?? 0,
        ordensConcluidas: operacional.ordensPorStatus['CONCLUIDA'] ?? 0,
        totalOrdensAtivas,
      },
      financeiro: {
        totalAReceber: financeiro.totalAReceber,
        totalVencido: financeiro.totalVencido,
        totalRecebidoMes: financeiro.totalRecebidoMes,
      },
    };
  }
}
