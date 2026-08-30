import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { VeiculosRepository } from "../repositories/veiculos.repository";
import { BuscarVeiculoUseCase } from "./buscar-veiculo.use-case";

describe("BuscarVeiculoUseCase", () => {
  it("retorna o veículo encontrado", async () => {
    const veiculo = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      marca: "Toyota",
      modelo: "Corolla",
    });
    const buscarPorId = jest.fn().mockResolvedValue(veiculo);

    const useCase = new BuscarVeiculoUseCase({
      buscarPorId,
    } as unknown as VeiculosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      veiculoId: veiculo.id,
    });

    expect(resultado).toBe(veiculo);
  });

  it("usa negocioId na busca (nunca busca só por veiculoId)", async () => {
    const veiculo = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      marca: "Toyota",
      modelo: "Corolla",
    });
    const buscarPorId = jest.fn().mockResolvedValue(veiculo);

    const useCase = new BuscarVeiculoUseCase({
      buscarPorId,
    } as unknown as VeiculosRepository);

    await useCase.execute({ negocioId: "neg-1", veiculoId: veiculo.id });

    expect(buscarPorId).toHaveBeenCalledWith("neg-1", veiculo.id);
  });

  it("lança NotFoundError quando o veículo não existe", async () => {
    const useCase = new BuscarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as VeiculosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", veiculoId: "vei-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });
});
