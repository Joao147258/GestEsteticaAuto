import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RemoverVeiculoInput } from "../dtos/remover-veiculo.input";
import { VeiculosRepository } from "../repositories/veiculos.repository";

// Remove um veículo. V1: remoção simples. A regra de impedir remoção de
// veículo com orçamento/OS/histórico financeiro entra quando os módulos
// relacionados estiverem prontos.
export class RemoverVeiculoUseCase {
  constructor(
    private readonly veiculosRepository: VeiculosRepository,
  ) {}

  async execute(input: RemoverVeiculoInput): Promise<void> {
    const veiculo = await this.veiculosRepository.buscarPorId(
      input.negocioId,
      input.veiculoId,
    );

    if (!veiculo) {
      throw new NotFoundError("Veículo não encontrado.");
    }

    await this.veiculosRepository.remover(input.negocioId, input.veiculoId);
  }
}
