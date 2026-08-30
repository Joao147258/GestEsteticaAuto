import { OrdemServico, OperacaoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { EntregarOrdemServicoUseCase } from "./entregar-ordem-servico.use-case";

describe("EntregarOrdemServicoUseCase", () => {
  // OS pronta para entregar: todos os itens concluídos e execução concluída.
  function criarOsConcluida() {
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
    ordemServico.concluir();
    return ordemServico;
  }

  it("entrega uma OS concluída, marca entregueEm e salva", async () => {
    const ordemServico = criarOsConcluida();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new EntregarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
    });

    expect(resultado.status).toBe("ENTREGUE");
    expect(resultado.entregueEm).toBeInstanceOf(Date);
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(ordemServico);
  });

  it("lança NotFoundError quando a OS não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new EntregarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: "os-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando a OS não está CONCLUIDA e não salva", async () => {
    const ordemServico = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn();

    const useCase = new EntregarOrdemServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      salvar,
    } as unknown as OrdensServicoRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", ordemServicoId: ordemServico.id }),
    ).rejects.toThrow(OperacaoError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
