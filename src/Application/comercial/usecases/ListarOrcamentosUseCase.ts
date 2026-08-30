import type { ListarOrcamentosDTO } from "../dtos/ListarOrcamentosDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// ListarOrcamentosUseCase — consulta orçamentos de um negócio com filtros.
// Use case somente leitura: não altera nem salva nada. Se não houver
// resultados, retorna lista vazia (sem lançar erro).
export class ListarOrcamentosUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: ListarOrcamentosDTO): Promise<OrcamentoOutputDTO[]> {
    const orcamentos = await this.orcamentosRepository.listarPorNegocio({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      veiculoId: input.veiculoId,
      status: input.status,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      busca: input.busca,
      pagina: input.pagina,
      limite: input.limite,
    });

    return orcamentos.map((orcamento) => OrcamentoMapper.paraOutput(orcamento));
  }
}
