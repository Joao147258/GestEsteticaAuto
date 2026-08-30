// Dados para ajuste manual de quantidade (correção de saldo, inventário,
// ajuste administrativo). Não usar para simular entrada/saída comum.
export type AjustarQuantidadeEstoqueInternoInput = {
  negocioId: string;
  produtoId: string;
  novaQuantidade: number;
  motivo?: string | null;
};
