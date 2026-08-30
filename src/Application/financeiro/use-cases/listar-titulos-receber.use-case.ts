import { TituloFinanceiro } from "../../../Domain";
import type { ListarTitulosReceberInput } from "../dtos/listar-titulos-receber.input";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";

// Lista os títulos a receber de um negócio com filtros. Use case somente
// leitura: não altera nem salva nada. Sem resultados, retorna lista vazia.
export class ListarTitulosReceberUseCase {
  constructor(
    private readonly titulosReceberRepository: TitulosReceberRepository,
  ) {}

  async execute(input: ListarTitulosReceberInput): Promise<TituloFinanceiro[]> {
    return this.titulosReceberRepository.listarPorNegocio({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      origem: input.origem,
      origemId: input.origemId,
      status: input.status,
      dataVencimentoInicio: input.dataVencimentoInicio,
      dataVencimentoFim: input.dataVencimentoFim,
      busca: input.busca,
      pagina: input.pagina,
      limite: input.limite,
    });
  }
}
