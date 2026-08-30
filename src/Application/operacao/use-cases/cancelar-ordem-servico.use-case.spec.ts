import { OrdemServico, OperacaoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { CancelarOrdemServicoUseCase } from "./cancelar-ordem-servico.use-case";

describe("CancelarOrdemServicoUseCase", () => {
  it("cancela uma OS com motivo e salva (mantém histórico)", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new CancelarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      motivo: "Cliente desistiu",
    });

    expect(resultado.status).toBe("CANCELADA");
    expect(resultado.canceladaEm).toBeInstanceOf(Date);
    // O motivo vira a descrição da última alteração no histórico.
    expect(resultado.alteracoes.at(-1)?.descricao).toBe("Cliente desistiu");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new CancelarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        ordemServicoId: "os-inexistente",
        motivo: "teste",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando a OS já está concluída e não salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const itemId = ordemServico.adicionarItem({
      servicoId: "serv-1",
      descricao: "Lavagem",
    });
    ordemServico.iniciar();
    ordemServico.iniciarItem(itemId);
    ordemServico.concluirItem(itemId);
    ordemServico.concluir();
    const salvar = jest.fn();

    const useCase = new CancelarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        ordemServicoId: ordemServico.id,
        motivo: "teste",
      }),
    ).rejects.toThrow(OperacaoError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
