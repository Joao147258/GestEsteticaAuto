import {
  MetricasComerciais,
  MetricasFinanceiras,
  MetricasGerais,
  MetricasOperacionais,
} from '../../../../Application/dashboard/queries/dashboard-query.repository';

// DashboardPresenter — formata métricas e indicadores analíticos para consumo no frontend.
// Assegura payloads padronizados, arredondamentos monetários e garantia de chaves zeradas (sem undefined/null).
export class DashboardPresenter {
  // Formata o resumo geral para a tela inicial (cards consolidados).
  static geralToHTTP(dados: MetricasGerais) {
    return {
      comercial: {
        orcamentosEmAberto: dados.comercial.orcamentosEmAberto,
        valorEmNegociacao: Number(dados.comercial.valorEmNegociacao.toFixed(2)),
        valorAprovadoMes: Number(dados.comercial.valorAprovadoMes.toFixed(2)),
      },
      operacional: {
        ordensEmExecucao: dados.operacional.ordensEmExecucao,
        ordensConcluidas: dados.operacional.ordensConcluidas,
        totalOrdensAtivas: dados.operacional.totalOrdensAtivas,
      },
      financeiro: {
        totalAReceber: Number(dados.financeiro.totalAReceber.toFixed(2)),
        totalVencido: Number(dados.financeiro.totalVencido.toFixed(2)),
        totalRecebidoMes: Number(dados.financeiro.totalRecebidoMes.toFixed(2)),
      },
    };
  }

  // Formata as métricas detalhadas da aba comercial.
  static comercialToHTTP(dados: MetricasComerciais) {
    const orcamentosPorStatus = Object.assign(
      { EM_ABERTO: 0, RASCUNHO: 0, ACEITO: 0, CANCELADO: 0 },
      dados.orcamentosPorStatus,
    );

    return {
      orcamentosPorStatus,
      valorEmNegociacao: Number(dados.valorEmNegociacao.toFixed(2)),
      valorAprovadoMes: Number(dados.valorAprovadoMes.toFixed(2)),
      totalOrcamentos: dados.totalOrcamentos,
    };
  }

  // Formata as métricas detalhadas da aba operacional (distribuição por status da OS).
  static operacionalToHTTP(dados: MetricasOperacionais) {
    const ordensPorStatus = Object.assign(
      {
        ABERTA: 0,
        AGUARDANDO_VEICULO: 0,
        EM_EXECUCAO: 0,
        PAUSADA: 0,
        CONCLUIDA: 0,
        ENTREGUE: 0,
        CANCELADA: 0,
      },
      dados.ordensPorStatus,
    );

    return {
      ordensPorStatus,
      totalOrdens: dados.totalOrdens,
    };
  }

  // Formata as métricas detalhadas da aba financeira (inadimplência, faturamento e recebimentos).
  static financeiroToHTTP(dados: MetricasFinanceiras) {
    const titulosPorStatus = Object.assign(
      { ABERTO: 0, PARCIALMENTE_PAGO: 0, PAGO: 0, CANCELADO: 0 },
      dados.titulosPorStatus,
    );

    return {
      totalAReceber: Number(dados.totalAReceber.toFixed(2)),
      totalVencido: Number(dados.totalVencido.toFixed(2)),
      totalRecebidoMes: Number(dados.totalRecebidoMes.toFixed(2)),
      titulosPorStatus,
    };
  }
}
