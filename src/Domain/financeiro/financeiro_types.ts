// Tipos compartilhados do módulo financeiro.
// Centraliza status, origens, tipos de parcela e o registro de histórico,
// usados por TituloFinanceiro, ParcelaFinanceira, Pagamento e FormaPagamento.

// Status do título financeiro (agregado).
// ABERTO → PARCIALMENTE_PAGO → PAGO | VENCIDO | CANCELADO
export type StatusTituloFinanceiro =
  | "ABERTO"
  | "PARCIALMENTE_PAGO"
  | "PAGO"
  | "VENCIDO"
  | "CANCELADO";

// Status da parcela financeira.
// PENDENTE → PARCIALMENTE_PAGA → PAGA | VENCIDA | CANCELADA
export type StatusParcelaFinanceira =
  | "PENDENTE"
  | "PARCIALMENTE_PAGA"
  | "PAGA"
  | "VENCIDA"
  | "CANCELADA";

// Status do pagamento.
// Pagamento nasce PENDENTE e pode ser CONFIRMADO ou CANCELADO.
export type StatusPagamento =
  | "PENDENTE"
  | "CONFIRMADO"
  | "CANCELADO";

// Origem do título financeiro — de onde nasce a obrigação.
export type OrigemTituloFinanceiro =
  | "ORCAMENTO"
  | "ORDEM_SERVICO"
  | "AVULSO"
  | "AJUSTE";

// Tipo da parcela financeira — sinal é uma parcela com tipo SINAL.
export type TipoParcelaFinanceira =
  | "SINAL"
  | "PARCELA";

// Tipo da alteração registrada no histórico do título.
export type TipoAlteracaoFinanceira =
  | "CRIACAO"
  | "ALTERACAO_STATUS"
  | "PAGAMENTO_REGISTRADO"
  | "PAGAMENTO_CANCELADO"
  | "CANCELAMENTO"
  | "REABERTURA";

// Registro de histórico financeiro — trilha de ações relevantes do título.
export interface RegistroAlteracaoFinanceiro {
  data: Date;
  autorId?: string | null;
  descricao: string;
  tipo: TipoAlteracaoFinanceira;
}
