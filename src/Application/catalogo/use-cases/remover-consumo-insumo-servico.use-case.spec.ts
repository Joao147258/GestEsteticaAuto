import { ConsumoInsumoServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";
import { RemoverConsumoInsumoServicoUseCase } from "./remover-consumo-insumo-servico.use-case";

describe("RemoverConsumoInsumoServicoUseCase", () => {
  it("remove consumo existente", async () => {
    const consumo = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 50,
      unidadeMedida: "ML",
    });
    const remover = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(consumo),
      remover,
    } as unknown as ConsumosInsumoServicoRepository;

    const useCase = new RemoverConsumoInsumoServicoUseCase(repositorio);
    await useCase.execute({ negocioId: "neg-1", consumoId: consumo.id });

    expect(repositorio.buscarPorId).toHaveBeenCalledWith("neg-1", consumo.id);
    expect(remover).toHaveBeenCalledWith("neg-1", consumo.id);
  });

  it("bloqueia remoção de consumo inexistente", async () => {
    const remover = jest.fn();
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      remover,
    } as unknown as ConsumosInsumoServicoRepository;

    const useCase = new RemoverConsumoInsumoServicoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", consumoId: "inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(remover).not.toHaveBeenCalled();
  });
});
