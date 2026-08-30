import { OrdemServico, StatusOrdemServico } from "../../../Domain";

// Contrato de persistência de ordens de serviço que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class OrdensServicoRepository {
  abstract salvar(ordemServico: OrdemServico): Promise<void>;

  abstract buscarPorId(
    negocioId: string,
    ordemServicoId: string,
  ): Promise<OrdemServico | null>;

  // Usado para idempotência do GerarOrdemServico: no máximo uma OS por orçamento.
  abstract buscarPorOrcamento(
    negocioId: string,
    orcamentoId: string,
  ): Promise<OrdemServico | null>;

  abstract listarPorNegocio(params: {
    negocioId: string;
    status?: StatusOrdemServico;
    clienteId?: string;
    veiculoId?: string;
    orcamentoId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<OrdemServico[]>;
}
