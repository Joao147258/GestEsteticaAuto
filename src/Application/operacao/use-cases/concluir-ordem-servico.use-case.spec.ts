import { OrdemServico, OperacaoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { ConcluirOrdemServicoUseCase } from "./concluir-ordem-servico.use-case";

describe("ConcluirOrdemServicoUseCase", () => {
  // OS pronta para concluir: todos os itens concluídos e execução iniciada.
  function criarOsConcluivel() {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const itemId = ordemServico.adicionarItem({
      servicoId: "serv-1",
      descricao: "Lavagem detalhada",
    });
    ordemServico.iniciar();
    ordemServico.iniciarItem(itemId);
    ordemServico.concluirItem(itemId);
    return ordemServico;
  }

  it("conclui uma OS válida e salva", async () => {
    const ordemServico = criarOsConcluivel();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new ConcluirOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(resultado.status).toBe("CONCLUIDA");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new ConcluirOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o status não permite concluir e não salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn();

    const useCase = new ConcluirOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: ordemServico.id }),
    ).rejects.toThrow(OperacaoError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("não baixa estoque automaticamente na conclusão", async () => {
    const ordemServico = criarOsConcluivel();
    const salvar = jest.fn().mockResolvedValue(undefined);
    const buscarPorId = jest.fn().mockResolvedValue(ordemServico);

    const useCase = new ConcluirOrdemServicoUseCase({
      buscarPorId,
      salvar,
    } as unknown as OrdensServicoRepository);

    await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    // O use-case só chama o repository de OS (busca + salvar) — nenhum
    // repositório de estoque é acionado.
    expect(buscarPorId).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledTimes(1);
  });
});
