import { Produto, Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";
import { ProdutosRepository } from "../repositories/produtos.repository";
import { ServicosRepository } from "../repositories/servicos.repository";
import { AdicionarConsumoInsumoServicoUseCase } from "./adicionar-consumo-insumo-servico.use-case";

describe("AdicionarConsumoInsumoServicoUseCase", () => {
  function criarServico(): Servico {
    return Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem detalhada",
      precoBase: 120,
    });
  }

  function criarProduto(tipoUso: Produto["tipoUso"]): Produto {
    return Produto.criar({
      negocioId: "neg-1",
      nome: "Shampoo automotivo",
      tipoUso,
      unidadeMedida: "ML",
    });
  }

  function montarRepositorios(opcoes: {
    servico?: Servico | null;
    produto?: Produto | null;
    salvar?: jest.Mock;
  }) {
    const consumosRepository = {
      salvar: opcoes.salvar ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as ConsumosInsumoServicoRepository;

    const servicosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(opcoes.servico ?? null),
    } as unknown as ServicosRepository;

    const produtosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(opcoes.produto ?? null),
    } as unknown as ProdutosRepository;

    return { consumosRepository, servicosRepository, produtosRepository };
  }

  it("aceita produto INSUMO_INTERNO e salva o consumo", async () => {
    const servico = criarServico();
    const produto = criarProduto("INSUMO_INTERNO");
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repos = montarRepositorios({ servico, produto, salvar });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );
    const consumo = await useCase.execute({
      negocioId: "neg-1",
      servicoId: servico.id,
      produtoId: produto.id,
      quantidade: 50,
      unidadeMedida: "ML",
    });

    expect(repos.servicosRepository.buscarPorId).toHaveBeenCalledWith(
      "neg-1",
      servico.id,
    );
    expect(repos.produtosRepository.buscarPorId).toHaveBeenCalledWith(
      "neg-1",
      produto.id,
    );
    expect(consumo.servicoId).toBe(servico.id);
    expect(consumo.produtoId).toBe(produto.id);
    expect(consumo.quantidade).toBe(50);
    expect(consumo.unidadeMedida).toBe("ML");
    expect(salvar).toHaveBeenCalledWith(consumo);
  });

  it("aceita produto AMBOS", async () => {
    const servico = criarServico();
    const produto = criarProduto("AMBOS");
    const repos = montarRepositorios({ servico, produto });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: servico.id,
        produtoId: produto.id,
        quantidade: 2,
        unidadeMedida: "UNIDADE",
      }),
    ).resolves.toBeDefined();
  });

  it("rejeita produto PRODUTO_VENDA e não salva", async () => {
    const servico = criarServico();
    const produto = criarProduto("PRODUTO_VENDA");
    const salvar = jest.fn();
    const repos = montarRepositorios({ servico, produto, salvar });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: servico.id,
        produtoId: produto.id,
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("rejeita serviço inexistente e não salva", async () => {
    const produto = criarProduto("INSUMO_INTERNO");
    const salvar = jest.fn();
    const repos = montarRepositorios({ servico: null, produto, salvar });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: "servico-inexistente",
        produtoId: produto.id,
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("rejeita produto inexistente e não salva", async () => {
    const servico = criarServico();
    const salvar = jest.fn();
    const repos = montarRepositorios({ servico, produto: null, salvar });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: servico.id,
        produtoId: "produto-inexistente",
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("respeita o escopo do negocioId na busca de serviço e produto", async () => {
    // Serviço pertence ao negócio A; produto ao negócio B — a busca escopada
    // por negocioId impede o vínculo entre negócios diferentes.
    const servico = Servico.criar({
      negocioId: "neg-A",
      nome: "Lavagem",
      precoBase: 80,
    });
    const produto = Produto.criar({
      negocioId: "neg-B",
      nome: "Shampoo",
      tipoUso: "INSUMO_INTERNO",
      unidadeMedida: "ML",
    });
    const repos = montarRepositorios({ servico: null, produto });

    const useCase = new AdicionarConsumoInsumoServicoUseCase(
      repos.consumosRepository,
      repos.servicosRepository,
      repos.produtosRepository,
    );

    // Buscando serviço do negócio B: não encontra o serviço do negócio A.
    await expect(
      useCase.execute({
        negocioId: "neg-B",
        servicoId: servico.id,
        produtoId: produto.id,
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(repos.servicosRepository.buscarPorId).toHaveBeenCalledWith(
      "neg-B",
      servico.id,
    );
  });
});
