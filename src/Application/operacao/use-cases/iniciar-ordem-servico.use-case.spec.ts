import { OrdemServico, OperacaoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { IniciarOrdemServicoUseCase } from "./iniciar-ordem-servico.use-case";

describe("IniciarOrdemServicoUseCase", () => {
  it("inicia uma OS válida e salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new IniciarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(resultado.status).toBe("EM_EXECUCAO");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new IniciarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o status não permite iniciar e não salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    ordemServico.cancelar({ descricao: "cliente desistiu" });
    const salvar = jest.fn();

    const useCase = new IniciarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: ordemServico.id }),
    ).rejects.toThrow(OperacaoError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
