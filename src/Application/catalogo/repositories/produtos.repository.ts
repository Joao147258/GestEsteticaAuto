import { Produto } from "../../../Domain";

// Contrato de persistência de produtos que a Application precisa.
// Só declara o necessário para orquestrar (buscar produto por id no negócio).
export abstract class ProdutosRepository {
  abstract buscarPorId(
    negocioId: string,
    produtoId: string,
  ): Promise<Produto | null>;
}
