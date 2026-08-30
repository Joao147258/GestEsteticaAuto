import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RemoverConsumoInsumoServicoInput } from "../dtos/remover-consumo-insumo-servico.input";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";

// Remove um consumo de insumo de um serviço, sempre no escopo do negocioId.
export class RemoverConsumoInsumoServicoUseCase {
  constructor(
    private readonly consumosRepository: ConsumosInsumoServicoRepository,
  ) {}

  async execute(input: RemoverConsumoInsumoServicoInput): Promise<void> {
    const consumo = await this.consumosRepository.buscarPorId(
      input.negocioId,
      input.consumoId,
    );

    if (!consumo) {
      throw new NotFoundError("Consumo não encontrado.");
    }

    await this.consumosRepository.remover(input.negocioId, input.consumoId);
  }
}
