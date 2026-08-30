import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { VeiculosRepository } from "../repositories/veiculos.repository";
import { RemoverVeiculoUseCase } from "./remover-veiculo.use-case";

describe("RemoverVeiculoUseCase", () => {
  it("remove um veículo existente usando negocioId + veiculoId", async () => {
    const veiculo = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      marca: "Toyota",
      modelo: "Corolla",
    });
    const remover = jest.fn().mockResolvedValue(undefined);

    const useCase = new RemoverVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(veiculo),
      remover,
    } as unknown as VeiculosRepository);

    await useCase.execute({ negocioId: "neg-1", veiculoId: veiculo.id });

    expect(remover).toHaveBeenCalledWith("neg-1", veiculo.id);
  });

  it("lança NotFoundError quando o veículo não existe e não remove", async () => {
    const remover = jest.fn();
    const useCase = new RemoverVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      remover,
    } as unknown as VeiculosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", veiculoId: "vei-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(remover).not.toHaveBeenCalled();
  });
});
