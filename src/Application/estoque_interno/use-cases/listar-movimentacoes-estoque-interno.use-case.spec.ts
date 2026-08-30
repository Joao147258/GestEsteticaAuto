import { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { ListarMovimentacoesEstoqueInternoUseCase } from "./listar-movimentacoes-estoque-interno.use-case";

describe("ListarMovimentacoesEstoqueInternoUseCase", () => {
  it("lista movimentações de estoque existente", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    estoque.adicionarEntrada(5, "Compra");
    const buscarPorProduto = jest.fn().mockResolvedValue(estoque);
    const repositorio = {
      buscarPorProduto,
    } as unknown as EstoqueInternoRepository;

    const useCase = new ListarMovimentacoesEstoqueInternoUseCase(repositorio);
    const movimentacoes = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
    });

    expect(movimentacoes).toHaveLength(2);
    expect(movimentacoes[0].tipo).toBe("ENTRADA");
    expect(movimentacoes[1].tipo).toBe("ENTRADA");
    expect(buscarPorProduto).toHaveBeenCalledWith("neg-1", "prod-1");
  });

  it("retorna erro quando estoque não existe", async () => {
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
    } as unknown as EstoqueInternoRepository;

    const useCase = new ListarMovimentacoesEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("não altera o estoque (apenas leitura)", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(estoque),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new ListarMovimentacoesEstoqueInternoUseCase(repositorio);
    await useCase.execute({ negocioId: "neg-1", produtoId: "prod-1" });

    expect(estoque.movimentacoes).toHaveLength(1);
    expect(salvar).not.toHaveBeenCalled();
  });
});
