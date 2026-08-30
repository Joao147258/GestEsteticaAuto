import { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { BuscarOrdemServicoUseCase } from "./buscar-ordem-servico.use-case";

describe("BuscarOrdemServicoUseCase", () => {
  function criarOs() {
    return OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
  }

  it("retorna a OS encontrada", async () => {
    const ordemServico = criarOs();
    const buscarPorId = jest.fn().mockResolvedValue(ordemServico);

    const useCase = new BuscarOrdemServicoUseCase({
      buscarPorId,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(resultado).toBe(ordemServico);
  });

  it("busca sempre no escopo do negocioId", async () => {
    const ordemServico = criarOs();
    const buscarPorId = jest.fn().mockResolvedValue(ordemServico);

    const useCase = new BuscarOrdemServicoUseCase({
      buscarPorId,
    } as unknown as OrdensServicoRepository);

    await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(buscarPorId).toHaveBeenCalledWith("neg-1", ordemServico.id);
  });

  it("lança NotFoundError quando a OS não existe", async () => {
    const useCase = new BuscarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });
});
