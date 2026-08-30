import {
  OrigemTituloFinanceiro,
  StatusTituloFinanceiro,
  TituloFinanceiro,
} from "../../../Domain";

// Contrato de persistência de títulos a receber que a Application precisa.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class TitulosReceberRepository {
  abstract salvar(titulo: TituloFinanceiro): Promise<void>;

  abstract buscarPorId(
    negocioId: string,
    tituloId: string,
  ): Promise<TituloFinanceiro | null>;

  // Usado para idempotência do GerarTituloReceber: no máximo um título por origem.
  abstract buscarPorOrigem(
    negocioId: string,
    origem: OrigemTituloFinanceiro,
    origemId: string,
  ): Promise<TituloFinanceiro | null>;

  abstract listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    origem?: OrigemTituloFinanceiro;
    origemId?: string;
    status?: StatusTituloFinanceiro;
    dataVencimentoInicio?: Date;
    dataVencimentoFim?: Date;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<TituloFinanceiro[]>;
}
