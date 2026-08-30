import { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { AtualizarOrdemServicoUseCase } from "./atualizar-ordem-servico.use-case";

describe("AtualizarOrdemServicoUseCase", () => {
  it("atualiza dados operacionais e salva, sem alterar status", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      observacoes: "obs antiga",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const previsaoInicio = new Date("2026-09-01T08:00:00Z");
    const previsaoConclusao = new Date("2026-09-01T12:00:00Z");

    const useCase = new AtualizarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      observacoes: "nova obs",
      previsaoInicio,
      previsaoConclusao,
    });

    expect(resultado.observacoes).toBe("nova obs");
    expect(resultado.previsaoInicio).toEqual(previsaoInicio);
    expect(resultado.previsaoConclusao).toEqual(previsaoConclusao);
    expect(resultado.status).toBe("ABERTA");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("não passa status no input — a troca de status é por use-cases próprios", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtualizarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      observacoes: "apenas observação",
    });

    expect(resultado.status).toBe("ABERTA");
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new AtualizarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
