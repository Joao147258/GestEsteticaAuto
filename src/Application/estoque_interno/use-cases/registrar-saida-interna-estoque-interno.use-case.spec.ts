import { EstoqueInterno, EstoqueInternoError } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { RegistrarSaidaInternaEstoqueInternoUseCase } from "./registrar-saida-interna-estoque-interno.use-case";

describe("RegistrarSaidaInternaEstoqueInternoUseCase", () => {
  it("registra saída manual com sucesso e salva", async () => {
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

    const useCase = new RegistrarSaidaInternaEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      quantidade: 3,
      motivo: "Uso em carro",
    });

    expect(resultado.quantidadeAtual).toBe(7);
    expect(resultado.movimentacoes.at(-1)?.tipo).toBe("SAIDA_INTERNA");
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("aceita referência manual opcional quando informada", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(estoque),
      salvar: jest.fn().mockResolvedValue(undefined),
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarSaidaInternaEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      quantidade: 2,
      motivo: "Retirada manual",
      referenciaTipo: "MANUAL",
      referenciaId: "ref-1",
    });

    const movimentacao = resultado.movimentacoes.at(-1);
    expect(movimentacao?.referenciaTipo).toBe("MANUAL");
    expect(movimentacao?.referenciaId).toBe("ref-1");
    // Movimentação manual não depende de item de OS.
    expect(movimentacao?.referenciaItemId).toBeNull();
  });

  it("retorna erro quando estoque não existe", async () => {
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarSaidaInternaEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "inexistente", quantidade: 3 }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro de saldo insuficiente do domínio e não salva", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 2,
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(estoque),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarSaidaInternaEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "prod-1", quantidade: 20 }),
    ).rejects.toThrow(EstoqueInternoError);
    expect(estoque.quantidadeAtual).toBe(2);
    expect(salvar).not.toHaveBeenCalled();
  });
});
