import { TipoMovimentacaoEstoqueInterno } from "./tipo_movimentacao_estoque_interno_types";
import { UnidadeMedida } from "../catalogo/unidade_medida_types";

// Propriedades da entidade MovimentacaoEstoqueInterno.
// Funciona como histórico: registra o que mudou (quantidade) e o saldo antes/depois.
export interface MovimentacaoEstoqueInternoProps {
  id: string;
  negocioId: string;
  estoqueInternoId: string;
  produtoId: string;
  tipo: TipoMovimentacaoEstoqueInterno;
  quantidade: number; // sempre positiva
  unidadeMedida: UnidadeMedida;
  quantidadeAnterior: number; // saldo do estoque antes da movimentação
  quantidadeNova: number; // saldo do estoque depois da movimentação (>= 0)
  motivo?: string | null;
  observacoes?: string | null;
  registradoEm: Date;
}
