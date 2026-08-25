import { UnidadeMedida } from "../catalogo/unidade_medida_types";
import { MovimentacaoEstoqueInternoProps } from "./MovimentacaoEstoqueInternoProps";

// Propriedades da entidade EstoqueInterno.
// Representa o saldo de um produto/insumo usado internamente na operação.
export interface EstoqueInternoProps {
  id: string;
  negocioId: string;
  produtoId: string;
  quantidadeAtual: number;
  unidadeMedida: UnidadeMedida;
  // Referência aproximada para relatórios e visualização de gastos —
  // não é cálculo contábil perfeito.
  custoUnitarioAproximado?: number | null;
  estoqueMinimo?: number | null;
  observacoes?: string | null;
  movimentacoes: MovimentacaoEstoqueInternoProps[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo EstoqueInterno.
export interface CriarEstoqueInternoProps {
  negocioId: string;
  produtoId: string;
  quantidadeInicial?: number;
  unidadeMedida: UnidadeMedida;
  custoUnitarioAproximado?: number | null;
  estoqueMinimo?: number | null;
  observacoes?: string | null;
}
