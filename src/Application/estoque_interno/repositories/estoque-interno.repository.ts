import { EstoqueInterno } from "../../../Domain";

// Contrato de persistência de estoque interno que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class EstoqueInternoRepository {
  abstract salvar(estoque: EstoqueInterno): Promise<void>;

  abstract buscarPorProduto(
    negocioId: string,
    produtoId: string,
  ): Promise<EstoqueInterno | null>;
}
