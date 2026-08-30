import { TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";
import { BuscarTituloReceberUseCase } from "./buscar-titulo-receber.use-case";

describe("BuscarTituloReceberUseCase", () => {
  function criarTitulo() {
    return TituloFinanceiro.criar({
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
  }

  it("retorna o título encontrado", async () => {
    const titulo = criarTitulo();
    const buscarPorId = jest.fn().mockResolvedValue(titulo);

    const useCase = new BuscarTituloReceberUseCase({
      buscarPorId,
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      tituloId: titulo.id,
    });

    expect(resultado).toBe(titulo);
  });

  it("usa negocioId na busca (nunca busca só por tituloId)", async () => {
    const titulo = criarTitulo();
    const buscarPorId = jest.fn().mockResolvedValue(titulo);

    const useCase = new BuscarTituloReceberUseCase({
      buscarPorId,
    } as unknown as TitulosReceberRepository);

    await useCase.execute({ negocioId: "neg-1", tituloId: titulo.id });

    expect(buscarPorId).toHaveBeenCalledWith("neg-1", titulo.id);
  });

  it("lança NotFoundError quando o título não existe", async () => {
    const useCase = new BuscarTituloReceberUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as TitulosReceberRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", tituloId: "tit-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });
});
