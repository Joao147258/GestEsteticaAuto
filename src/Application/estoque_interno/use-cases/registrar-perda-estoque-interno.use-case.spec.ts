import { EstoqueInterno, EstoqueInternoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { RegistrarPerdaEstoqueInternoUseCase } from "./registrar-perda-estoque-interno.use-case";

describe("RegistrarPerdaEstoqueInternoUseCase", () => {
  it("registra perda com sucesso e salva", async () => {
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

    const useCase = new RegistrarPerdaEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      quantidade: 2,
      motivo: "Frasco quebrado",
    });

    expect(resultado.quantidadeAtual).toBe(8);
    expect(resultado.movimentacoes.at(-1)?.tipo).toBe("PERDA");
    expect(resultado.movimentacoes.at(-1)?.motivo).toBe("Frasco quebrado");
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("retorna erro quando estoque não existe", async () => {
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarPerdaEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "inexistente", quantidade: 2 }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro de saldo insuficiente do domínio e não salva", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 3,
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(estoque),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarPerdaEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "prod-1", quantidade: 10 }),
    ).rejects.toThrow(EstoqueInternoError);
    expect(estoque.quantidadeAtual).toBe(3);
    expect(salvar).not.toHaveBeenCalled();
  });
});
