import { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";
import { ConsultarSaldoEstoqueInternoUseCase } from "./consultar-saldo-estoque-interno.use-case";

describe("ConsultarSaldoEstoqueInternoUseCase", () => {
  it("consulta estoque existente", async () => {
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const buscarPorProduto = jest.fn().mockResolvedValue(estoque);
    const repositorio = {
      buscarPorProduto,
    } as unknown as EstoqueInternoRepository;

    const useCase = new ConsultarSaldoEstoqueInternoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      produtoId: "prod-1",
    });

    expect(resultado).toBe(estoque);
    expect(resultado.quantidadeAtual).toBe(10);
    expect(buscarPorProduto).toHaveBeenCalledWith("neg-1", "prod-1");
  });

  it("retorna erro quando estoque não existe", async () => {
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
    } as unknown as EstoqueInternoRepository;

    const useCase = new ConsultarSaldoEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", produtoId: "prod-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("respeita o negocioId na busca", async () => {
    const repositorio = {
      buscarPorProduto: jest.fn().mockResolvedValue(null),
    } as unknown as EstoqueInternoRepository;

    const useCase = new ConsultarSaldoEstoqueInternoUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-2", produtoId: "prod-1" }),
    ).rejects.toThrow(NotFoundError);
    // A busca usa o negocioId recebido — estoque de outro negócio não é achado.
    expect(repositorio.buscarPorProduto).toHaveBeenCalledWith("neg-2", "prod-1");
  });
});
