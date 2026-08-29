import { StatusPagamento } from "./financeiro_types";

// Propriedades da entidade Pagamento.
// Representa a baixa (parcial ou total) de uma ParcelaFinanceira.
// FormaPagamento referenciada por id; guarda um snapshot da descrição.
export interface PagamentoProps {
  id: string;
  negocioId: string;
  tituloFinanceiroId: string;
  parcelaFinanceiraId: string;
  valor: number;
  formaPagamentoId: string;
  formaPagamentoDescricao: string;
  dataPagamento: Date;
  status: StatusPagamento;
  observacoes?: string | null;
  criadoEm: Date;
  confirmadoEm?: Date | null;
  canceladoEm?: Date | null;
  motivoCancelamento?: string | null;
}

// Dados necessários para criar um novo Pagamento.
// Nasce como PENDENTE; CONFIRMADO compõe o valor pago da parcela.
export interface CriarPagamentoProps {
  negocioId: string;
  tituloFinanceiroId: string;
  parcelaFinanceiraId: string;
  valor: number;
  formaPagamentoId: string;
  formaPagamentoDescricao: string;
  dataPagamento?: Date;
  observacoes?: string | null;
}
