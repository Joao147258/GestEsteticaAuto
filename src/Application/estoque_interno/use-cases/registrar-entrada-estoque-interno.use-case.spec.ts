import { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { RegistrarEntradaEstoqueInternoUseCase } from "./registrar-entrada-estoque-interno.use-case";

describe("RegistrarEntradaEstoqueInternoUseCase", () => {
  it("registra entrada com sucesso e salva", async () => {
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

    const useCase = new RegistrarEntradaEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
      quantidade: 5,
      motivo: "Compra",
    });

    // A mudança de quantidade vem do domínio (adicionarEntrada), não da Application.
    expect(resultado.quantidadeAtual).toBe(15);
    const movimentacao = resultado.movimentacoes.at(-1);
    expect(movimentacao?.tipo).toBe("ENTRADA");
    expect(movimentacao?.motivo).toBe("Compra");
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("retorna erro quando estoque não existe", async () => {
    const salvar = jest.fn();
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as EstoqueInternoRepository;

    const useCase = new RegistrarEntradaEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "inexistente", quantidade: 5 }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
