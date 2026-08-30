import { TituloFinanceiro } from "../../../Domain";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";
import { ListarTitulosReceberUseCase } from "./listar-titulos-receber.use-case";

describe("ListarTitulosReceberUseCase", () => {
  it("repassa os filtros e retorna a lista do repository", async () => {
    const titulo = TituloFinanceiro.criar({
      negocioId: "neg-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      clienteId: "cli-1",
      descricao: "Serviço de estética",
      valorOriginal: 120,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA",
          valorOriginal: 120,
          dataVencimento: new Date("2026-09-01"),
        },
      ],
    });
    const listarPorNegocio = jest.fn().mockResolvedValue([titulo]);

    const useCase = new ListarTitulosReceberUseCase({
      listarPorNegocio,
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: "cli-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      status: "ABERTO",
      dataVencimentoInicio: new Date("2026-08-01"),
      dataVencimentoFim: new Date("2026-09-30"),
      busca: "estética",
      pagina: 1,
      limite: 20,
    });

    expect(resultado).toEqual([titulo]);
    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      clienteId: "cli-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      status: "ABERTO",
      dataVencimentoInicio: expect.any(Date),
      dataVencimentoFim: expect.any(Date),
      busca: "estética",
      pagina: 1,
      limite: 20,
    });
  });

  it("retorna lista vazia sem lançar erro", async () => {
    const useCase = new ListarTitulosReceberUseCase({
      listarPorNegocio: jest.fn().mockResolvedValue([]),
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute({ negocioId: "neg-1" });

    expect(resultado).toEqual([]);
  });
});
