// Contratos e tipos de leitura analítica para o Dashboard do GestCorp Auto.
// Como o dashboard é um Read-Model (CQRS), ele consolida agregados de negócio sem manipular entidades de domínio.

export type MetricasComerciais = {
  orcamentosPorStatus: {
    EM_ABERTO: number;
    RASCUNHO: number;
    ACEITO: number;
    CANCELADO: number;
    [status: string]: number;
  };
  valorEmNegociacao: number;
  valorAprovadoMes: number;
  totalOrcamentos: number;
};

export type MetricasOperacionais = {
  ordensPorStatus: {
    ABERTA: number;
    AGUARDANDO_VEICULO: number;
    EM_EXECUCAO: number;
    PAUSADA: number;
    CONCLUIDA: number;
    ENTREGUE: number;
    CANCELADA: number;
    [status: string]: number;
  };
  totalOrdens: number;
};

export type MetricasFinanceiras = {
  totalAReceber: number;
  totalVencido: number;
  totalRecebidoMes: number;
  titulosPorStatus: {
    ABERTO: number;
    PARCIALMENTE_PAGO: number;
    PAGO: number;
    CANCELADO: number;
    [status: string]: number;
  };
};

export type MetricasGerais = {
  comercial: {
    orcamentosEmAberto: number;
    valorEmNegociacao: number;
    valorAprovadoMes: number;
  };
  operacional: {
    ordensEmExecucao: number;
    ordensConcluidas: number;
    totalOrdensAtivas: number;
  };
  financeiro: {
    totalAReceber: number;
    totalVencido: number;
    totalRecebidoMes: number;
  };
};

export type ConsultarMetricasInput = {
  negocioId: string;
  dataInicio?: Date;
  dataFim?: Date;
};

// DashboardQueryRepository — contrato abstrato de consultas analíticas para o painel de gestão.
// Implementado pela Infrastructure via PrismaDashboardQueryRepository.
export abstract class DashboardQueryRepository {
  abstract obterMetricasComerciais(input: ConsultarMetricasInput): Promise<MetricasComerciais>;
  abstract obterMetricasOperacionais(input: ConsultarMetricasInput): Promise<MetricasOperacionais>;
  abstract obterMetricasFinanceiras(input: ConsultarMetricasInput): Promise<MetricasFinanceiras>;
  abstract obterMetricasGerais(input: ConsultarMetricasInput): Promise<MetricasGerais>;
}
