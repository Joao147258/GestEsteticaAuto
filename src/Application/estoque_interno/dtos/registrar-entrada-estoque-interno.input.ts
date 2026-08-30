// Dados para registrar uma entrada (reposição/compra) no estoque interno.
export type RegistrarEntradaEstoqueInternoInput = {
  negocioId: string;
  produtoId: string;
  quantidade: number;
  motivo?: string | null;
};
