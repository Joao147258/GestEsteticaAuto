import { Veiculo } from "../../../Domain";
import type { ListarVeiculosInput } from "../dtos/listar-veiculos.input";
import { VeiculosRepository } from "../repositories/veiculos.repository";

// Lista os veículos de um negócio com filtros. Use case somente leitura:
// não altera nem salva nada. Sem resultados, retorna lista vazia.
export class ListarVeiculosUseCase {
  constructor(
    private readonly veiculosRepository: VeiculosRepository,
  ) {}

  async execute(input: ListarVeiculosInput): Promise<Veiculo[]> {
    return this.veiculosRepository.listarPorNegocio({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      busca: input.busca,
      pagina: input.pagina,
      limite: input.limite,
    });
  }
}
