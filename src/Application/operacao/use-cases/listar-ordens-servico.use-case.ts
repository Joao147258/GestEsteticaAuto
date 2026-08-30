import type { OrdemServico } from "../../../Domain";
import type { ListarOrdensServicoInput } from "../dtos/listar-ordens-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Lista as OS de um negócio com filtros. Use case somente leitura: não altera
// nem salva nada. Sem resultados, retorna lista vazia (sem lançar erro).
export class ListarOrdensServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: ListarOrdensServicoInput): Promise<OrdemServico[]> {
    return this.ordensServicoRepository.listarPorNegocio({
      negocioId: input.negocioId,
      status: input.status,
      clienteId: input.clienteId,
      veiculoId: input.veiculoId,
      orcamentoId: input.orcamentoId,
      busca: input.busca,
      pagina: input.pagina,
      limite: input.limite,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }
}
