import { OrdemServico, OperacaoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { PausarOrdemServicoUseCase } from "./pausar-ordem-servico.use-case";

describe("PausarOrdemServicoUseCase", () => {
  function criarOsEmExecucao() {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    ordemServico.iniciar();
    return ordemServico;
  }

  it("pausa uma OS em execução e salva", async () => {
    const ordemServico = criarOsEmExecucao();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new PausarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(resultado.status).toBe("PAUSADA");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new PausarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o status não permite pausar e não salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn();

    const useCase = new PausarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: ordemServico.id }),
    ).rejects.toThrow(OperacaoError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
