import { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { AjustarQuantidadeEstoqueInternoUseCase } from "./ajustar-quantidade-estoque-interno.use-case";

describe("AjustarQuantidadeEstoqueInternoUseCase", () => {
  it("ajusta quantidade com sucesso e salva", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(estoque),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new AjustarQuantidadeEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      novaQuantidade: 12,
      motivo: "Inventário",
    });

    expect(resultado.quantidadeAtual).toBe(12);
    expect(resultado.movimentacoes.at(-1)?.tipo).toBe("AJUSTE");
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("retorna erro quando estoque não existe", async () => {
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new AjustarQuantidadeEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "inexistente", novaQuantidade: 5 }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
