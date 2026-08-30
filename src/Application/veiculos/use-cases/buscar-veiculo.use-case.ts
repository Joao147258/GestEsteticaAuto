import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { BuscarVeiculoInput } from "../dtos/buscar-veiculo.input";
import { VeiculosRepository } from "../repositories/veiculos.repository";

// Busca um veículo pelo id, sempre no escopo do negocioId — um negócio nunca
// acessa veículo de outro. Se não encontrar, lança NotFoundError.
export class BuscarVeiculoUseCase {
  constructor(
    private readonly veiculosRepository: VeiculosRepository,
  ) {}

  async execute(input: BuscarVeiculoInput): Promise<Veiculo> {
    const veiculo = await this.veiculosRepository.buscarPorId(
      input.negocioId,
      input.veiculoId,
    );

    if (!veiculo) {
      throw new NotFoundError("Veículo não encontrado.");
    }

    return veiculo;
  }
}
