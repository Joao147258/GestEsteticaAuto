import { EstoqueInterno } from "../../../Domain";

// Contrato de persistência de estoque interno que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class EstoqueInternoRepository {
  abstract salvar(estoque: EstoqueInterno): Promise<void>;

  abstract buscarPorProduto(
    negocioId: string,
    produtoId: string,
  ): Promise<EstoqueInterno | null>;

  // Verifica se já existe movimentação com a mesma origem operacional.
  // Chave lógica: negocioId + referenciaTipo + referenciaId +
  // referenciaItemId + produtoId. Usada para baixa idempotente da operação.
  abstract existeMovimentacaoPorOrigem(params: {
    negocioId: string;
    referenciaTipo: string;
    referenciaId: string;
    referenciaItemId?: string;
    produtoId?: string;
  }): Promise<boolean>;
}
