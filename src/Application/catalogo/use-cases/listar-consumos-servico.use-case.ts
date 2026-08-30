import type { ConsumoInsumoServico } from "../../../Domain";
import type { ListarConsumosServicoInput } from "../dtos/listar-consumos-servico.input";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";

// Lista os consumos de insumo configurados para um serviço do negócio.
// Operação apenas de leitura — não altera estoque nem catálogo.
export class ListarConsumosServicoUseCase {
  constructor(
    private readonly consumosRepository: ConsumosInsumoServicoRepository,
  ) {}

  async execute(input: ListarConsumosServicoInput): Promise<ConsumoInsumoServico[]> {
    return this.consumosRepository.listarPorServico(
      input.negocioId,
      input.servicoId,
    );
  }
}
