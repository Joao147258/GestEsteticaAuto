import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { AtualizarVeiculoInput } from "../dtos/atualizar-veiculo.input";
import { VeiculosRepository } from "../repositories/veiculos.repository";

// Atualiza dados cadastrais simples do veículo, sem trocar o dono (clienteId
// não entra na atualização comum). Validação de placa duplicada só acontece
// quando a placa realmente muda. A edição dos campos é do Domain, via
// Veiculo.atualizarDados (cada campo delega ao método específico com histórico).
export class AtualizarVeiculoUseCase {
  constructor(
    private readonly veiculosRepository: VeiculosRepository,
  ) {}

  async execute(input: AtualizarVeiculoInput): Promise<Veiculo> {
    const veiculo = await this.veiculosRepository.buscarPorId(
      input.negocioId,
      input.veiculoId,
    );

    if (!veiculo) {
      throw new NotFoundError("Veículo não encontrado.");
    }

    const placa = input.placa?.trim();
    if (placa && placa !== veiculo.placa) {
      const veiculoComMesmaPlaca = await this.veiculosRepository.buscarPorPlaca(
        input.negocioId,
        placa,
      );
      if (veiculoComMesmaPlaca && veiculoComMesmaPlaca.id !== veiculo.id) {
        throw new ValidationError("Já existe outro veículo com esta placa.");
      }
    }

    veiculo.atualizarDados({
      placa: input.placa,
      marca: input.marca,
      modelo: input.modelo,
      anoFabricacao: input.anoFabricacao,
      anoModelo: input.anoModelo,
      cor: input.cor,
      quilometragem: input.quilometragem,
      observacoes: input.observacoes,
    });

    await this.veiculosRepository.salvar(veiculo);

    return veiculo;
  }
}
