import { UnidadeMedida } from "../../../Domain";

// Dados para criar o registro de estoque interno de um produto do negócio.
// O saldo inicial entra como movimentação ENTRADA (regra do domínio).
export type CriarItemEstoqueInternoInput = {
  negocioId: string;
  produtoId: string;
  unidadeMedida: UnidadeMedida;
  quantidadeInicial?: number;
  custoUnitarioAproximado?: number | null;
  estoqueMinimo?: number | null;
  observacoes?: string | null;
};
