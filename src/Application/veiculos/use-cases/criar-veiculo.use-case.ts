import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ClientesRepository } from "../../clientes/repositories/clientes.repository";
import type { CriarVeiculoInput } from "../dtos/criar-veiculo.input";
import { VeiculosRepository } from "../repositories/veiculos.repository";

// Cria um veículo vinculado a um cliente existente no mesmo negócio.
// Validações da Application: cliente existe (depende de repository) e placa
// não duplicada no negócio. A regra de campos obrigatórios (marca/modelo) e a
// validação de placa são do Domain (Veiculo.criar).
export class CriarVeiculoUseCase {
  constructor(
    private readonly veiculosRepository: VeiculosRepository,
    private readonly clientesRepository: ClientesRepository,
  ) {}

  async execute(input: CriarVeiculoInput): Promise<Veiculo> {
    const cliente = await this.clientesRepository.buscarPorId(
      input.negocioId,
      input.clienteId,
    );
    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado.");
    }

    const placa = input.placa?.trim();
    if (placa) {
      const veiculoComMesmaPlaca = await this.veiculosRepository.buscarPorPlaca(
        input.negocioId,
        placa,
      );
      if (veiculoComMesmaPlaca) {
        throw new ValidationError("Já existe um veículo com esta placa.");
      }
    }

    const veiculo = Veiculo.criar({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      placa,
      marca: input.marca,
      modelo: input.modelo,
      anoFabricacao: input.anoFabricacao,
      anoModelo: input.anoModelo,
      cor: input.cor,
      chassi: input.chassi,
      renavam: input.renavam,
      quilometragem: input.quilometragem,
      observacoes: input.observacoes,
    });

    await this.veiculosRepository.salvar(veiculo);

    return veiculo;
  }
}
