// Status da forma de pagamento (default "ATIVA" no schema Prisma).
export type StatusFormaPagamento = "ATIVA" | "INATIVA";

// Tipo da forma de pagamento.
// Alinhado ao enum TipoFormaPagamento do schema Prisma.
export type TipoFormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "BOLETO"
  | "TRANSFERENCIA"
  | "OUTRO";

// Propriedades da entidade FormaPagamento.
// Representa os meios de pagamento aceitos pelo negócio (PIX, cartão, etc).
export interface FormaPagamentoProps {
  id: string;
  negocioId: string;
  nome: string;
  tipo?: TipoFormaPagamento | null;
  status: StatusFormaPagamento;
  exigeConfirmacaoManual?: boolean;
  criadoEm: Date;
  atualizadoEm?: Date;
}

// Dados necessários para criar uma nova FormaPagamento.
export interface CriarFormaPagamentoProps {
  negocioId: string;
  nome: string;
  tipo?: TipoFormaPagamento | null;
  exigeConfirmacaoManual?: boolean;
}
