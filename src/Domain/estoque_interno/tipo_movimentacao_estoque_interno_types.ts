// Tipos de movimentação do estoque interno.
// Focado apenas em controle interno — sem venda, reserva ou devolução.
export type TipoMovimentacaoEstoqueInterno =
  | "ENTRADA"
  | "SAIDA_INTERNA"
  | "PERDA"
  | "AJUSTE";
