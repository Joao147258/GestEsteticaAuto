import { OrdemServico } from "../../../Domain";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { ListarOrdensServicoUseCase } from "./listar-ordens-servico.use-case";

describe("ListarOrdensServicoUseCase", () => {
  it("repassa os filtros e retorna a lista do repository", async () => {
    const os1 = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const listarPorNegocio = jest.fn().mockResolvedValue([os1]);

    const useCase = new ListarOrdensServicoUseCase({
      listarPorNegocio,
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      status: "EM_EXECUCAO",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      orcamentoId: "orc-1",
      busca: "lavagem",
      pagina: 1,
      limite: 20,
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
    });

    expect(resultado).toEqual([os1]);
    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      status: "EM_EXECUCAO",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      orcamentoId: "orc-1",
      busca: "lavagem",
      pagina: 1,
      limite: 20,
      dataInicio: expect.any(Date),
      dataFim: expect.any(Date),
    });
  });

  it("retorna lista vazia quando não há resultados (sem lançar erro)", async () => {
    const useCase = new ListarOrdensServicoUseCase({
      listarPorNegocio: jest.fn().mockResolvedValue([]),
    } as unknown as OrdensServicoRepository);

    const resultado = await useCase.execute({ negocioId: "neg-1" });

    expect(resultado).toEqual([]);
  });
});
