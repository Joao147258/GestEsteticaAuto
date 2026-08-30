import { OrdemServico } from "../../../Domain";

// Contrato de persistência de ordens de serviço que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class OrdensServicoRepository {
  abstract buscarPorId(
    negocioId: string,
    ordemServicoId: string,
  ): Promise<OrdemServico | null>;
}
