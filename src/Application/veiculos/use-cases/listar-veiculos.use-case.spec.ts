import { Veiculo } from "../../../Domain";
import { VeiculosRepository } from "../repositories/veiculos.repository";
import { ListarVeiculosUseCase } from "./listar-veiculos.use-case";

describe("ListarVeiculosUseCase", () => {
  it("repassa os filtros e retorna a lista do repository", async () => {
    const veiculo = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      marca: "Toyota",
      modelo: "Corolla",
    });
    const listarPorNegocio = jest.fn().mockResolvedValue([veiculo]);

    const useCase = new ListarVeiculosUseCase({
      listarPorNegocio,
    } as unknown as VeiculosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: "cli-1",
      busca: "corolla",
      pagina: 1,
      limite: 20,
    });

    expect(resultado).toEqual([veiculo]);
    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      clienteId: "cli-1",
      busca: "corolla",
      pagina: 1,
      limite: 20,
    });
  });

  it("retorna lista vazia sem lançar erro", async () => {
    const useCase = new ListarVeiculosUseCase({
      listarPorNegocio: jest.fn().mockResolvedValue([]),
    } as unknown as VeiculosRepository);

    const resultado = await useCase.execute({ negocioId: "neg-1" });

    expect(resultado).toEqual([]);
  });
});
