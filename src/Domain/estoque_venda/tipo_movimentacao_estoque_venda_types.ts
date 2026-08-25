// Tipos de movimentação do estoque de venda.
export type TipoMovimentacaoEstoqueVenda =
  | "ENTRADA"
  | "RESERVA"
  | "CANCELAMENTO_RESERVA"
  | "BAIXA_VENDA"
  | "DEVOLUCAO"
  | "PERDA"
  | "AJUSTE";
