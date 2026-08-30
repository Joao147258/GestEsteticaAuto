import { EstoqueInterno } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { CriarItemEstoqueInternoUseCase } from "./criar-item-estoque-interno.use-case";

describe("CriarItemEstoqueInternoUseCase", () => {
  it("cria estoque interno e salva com saldo inicial como ENTRADA", async () => {
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new CriarItemEstoqueInternoUseCase(repositorio);
    const estoque = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });

    expect(estoque).toBeInstanceOf(EstoqueInterno);
    expect(estoque.quantidadeAtual).toBe(10);
    expect(estoque.movimentacoes).toHaveLength(1);
    expect(estoque.movimentacoes[0].tipo).toBe("ENTRADA");
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("bloqueia quando já existe estoque para o produto no negócio", async () => {
    const existente = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(existente),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new CriarItemEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        produtoId: "prod-1",
        unidadeMedida: "UNIDADE",
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
