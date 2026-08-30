import {
  ConsumoInsumoServico,
  EstoqueInterno,
  OrdemServico,
  Produto,
} from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ConsumosInsumoServicoRepository } from "../../catalogo/repositories/consumos-insumo-servico.repository";
import { ProdutosRepository } from "../../catalogo/repositories/produtos.repository";
import { EstoqueInternoRepository } from "../../estoque_interno/repositories/estoque-interno.repository";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { ConfirmarConsumoInsumosItemOSUseCase } from "./confirmar-consumo-insumos-item-os.use-case";

describe("ConfirmarConsumoInsumosItemOSUseCase", () => {
  function criarOsComItem(): { ordemServico: OrdemServico; itemId: string } {
    const os = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const itemId = os.adicionarItem({
      servicoId: "serv-1",
      descricao: "Lavagem detalhada",
    });
    return { ordemServico: os, itemId };
  }

  function criarConsumo(overrides: Partial<Parameters<typeof ConsumoInsumoServico.criar>[0]> = {}) {
    return ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 50,
      unidadeMedida: "ML",
      ...overrides,
    });
  }

  function montarRepositorios(opcoes: {
    ordemServico: OrdemServico;
    consumos?: ConsumoInsumoServico[];
    estoque?: EstoqueInterno | null;
    produto?: Produto | null;
    salvar?: jest.Mock;
    jaRegistrado?: boolean;
  }) {
    const ordensServicoRepository = {
      buscarPorId: jest.fn().mockResolvedValue(opcoes.ordemServico),
    } as unknown as OrdensServicoRepository;

    const consumosRepository = {
      listarPorServico: jest
        .fn()
        .mockResolvedValue(opcoes.consumos ?? []),
    } as unknown as ConsumosInsumoServicoRepository;

    const estoquesRepository = {
      buscarPorProduto: jest.fn().mockResolvedValue(opcoes.estoque ?? null),
      salvar: opcoes.salvar ?? jest.fn().mockResolvedValue(undefined),
      existeMovimentacaoPorOrigem: jest
        .fn()
        .mockResolvedValue(opcoes.jaRegistrado ?? false),
    } as unknown as EstoqueInternoRepository;

    const produtosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(opcoes.produto ?? null),
    } as unknown as ProdutosRepository;

    return { ordensServicoRepository, consumosRepository, estoquesRepository, produtosRepository };
  }

  it("registra saída corretamente e mantém vínculo com a OS", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo();
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "ML",
      quantidadeInicial: 100,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repos = montarRepositorios({
      ordemServico,
      consumos: [consumo],
      estoque,
      salvar,
    });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(estoque.quantidadeAtual).toBe(50);
    expect(resultado.realizados).toEqual([
      { produtoId: "prod-1", quantidade: 50, unidadeMedida: "ML" },
    ]);
    expect(resultado.insuficientes).toEqual([]);
    expect(resultado.jaRegistrados).toEqual([]);
    // Vínculo com a OS (e com o item) na movimentação gerada pela baixa.
    const movimentacao = estoque.movimentacoes.at(-1);
    expect(movimentacao?.tipo).toBe("SAIDA_INTERNA");
    expect(movimentacao?.referenciaId).toBe(ordemServico.id);
    expect(movimentacao?.referenciaTipo).toBe("ORDEM_SERVICO");
    expect(movimentacao?.referenciaItemId).toBe(itemId);
    expect(salvar).toHaveBeenCalledWith(estoque);
  });

  it("converte a unidade do consumo para a unidade do estoque", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 50, unidadeMedida: "ML" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "LITRO",
      quantidadeInicial: 2,
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    // 50 ML → 0.05 LITRO baixado do estoque em LITRO.
    expect(estoque.quantidadeAtual).toBeCloseTo(1.95, 10);
    expect(resultado.realizados[0]).toMatchObject({
      quantidade: 0.05,
      unidadeMedida: "LITRO",
    });
  });

  it("retorna alerta de estoque mínimo após a baixa", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 6, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
      estoqueMinimo: 5,
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(estoque.quantidadeAtual).toBe(4);
    expect(resultado.alertasEstoqueMinimo).toEqual([
      { produtoId: "prod-1", quantidadeAtual: 4, estoqueMinimo: 5 },
    ]);
  });

  it("trata saldo insuficiente sem corromper o estoque", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 5, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 2,
    });
    const salvar = jest.fn();
    const repos = montarRepositorios({
      ordemServico,
      consumos: [consumo],
      estoque,
      salvar,
    });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    // Saldo permanece intacto e nenhuma persistência é feita para o insumo.
    expect(estoque.quantidadeAtual).toBe(2);
    expect(resultado.realizados).toEqual([]);
    expect(resultado.insuficientes).toEqual([
      { produtoId: "prod-1", motivo: "Saldo insuficiente para baixar" },
    ]);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("utiliza custoUnitarioAproximado do estoque como primeira fonte", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 1, unidadeMedida: "LITRO" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "LITRO",
      quantidadeInicial: 10,
      custoUnitarioAproximado: 18.5,
    });
    const produto = Produto.criar({
      negocioId: "neg-1",
      nome: "Shampoo",
      tipoUso: "INSUMO_INTERNO",
      unidadeMedida: "LITRO",
      custoReferencia: 999,
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque, produto });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado.custoEstimado).toBe(18.5);
    expect(resultado.possuiCustosDesconhecidos).toBe(false);
  });

  it("utiliza custoReferencia do produto como fallback", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 2, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const produto = Produto.criar({
      negocioId: "neg-1",
      nome: "Pano microfibra",
      tipoUso: "INSUMO_INTERNO",
      unidadeMedida: "UNIDADE",
      custoReferencia: 12,
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque, produto });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    // Estoque sem custo → usa custoReferencia do produto (2 × 12).
    expect(resultado.custoEstimado).toBe(24);
    expect(resultado.possuiCustosDesconhecidos).toBe(false);
  });

  it("informa custo desconhecido quando nenhuma fonte de custo existe", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 1, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const produto = Produto.criar({
      negocioId: "neg-1",
      nome: "Insumo sem custo",
      tipoUso: "INSUMO_INTERNO",
      unidadeMedida: "UNIDADE",
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque, produto });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado.custoEstimado).toBe(0);
    expect(resultado.possuiCustosDesconhecidos).toBe(true);
  });

  it("lança NotFoundError quando a ordem de serviço não existe", async () => {
    const ordensServicoRepository = {
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as OrdensServicoRepository;

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      ordensServicoRepository,
      {} as unknown as ConsumosInsumoServicoRepository,
      {} as unknown as EstoqueInternoRepository,
      {} as unknown as ProdutosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        ordemServicoId: "os-inexistente",
        itemOrdemServicoId: "item-1",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("lança NotFoundError quando o item não existe na OS", async () => {
    const { ordemServico } = criarOsComItem();
    const ordensServicoRepository = {
      buscarPorId: jest.fn().mockResolvedValue(ordemServico),
    } as unknown as OrdensServicoRepository;

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      ordensServicoRepository,
      {} as unknown as ConsumosInsumoServicoRepository,
      {} as unknown as EstoqueInternoRepository,
      {} as unknown as ProdutosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        ordemServicoId: ordemServico.id,
        itemOrdemServicoId: "item-inexistente",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("não baixa novamente insumo já registrado e retorna em jaRegistrados", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 2, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const salvar = jest.fn();
    const repos = montarRepositorios({
      ordemServico,
      consumos: [consumo],
      estoque,
      salvar,
      jaRegistrado: true,
    });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado.jaRegistrados).toEqual([{ produtoId: "prod-1" }]);
    expect(resultado.realizados).toEqual([]);
    // O estoque não sofre nova baixa nem é salvo.
    expect(estoque.quantidadeAtual).toBe(10);
    expect(salvar).not.toHaveBeenCalled();
    expect(repos.estoquesRepository.buscarPorProduto).not.toHaveBeenCalled();
  });

  it("usa a chave lógica completa da origem na verificação de duplicidade", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 2, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const repos = montarRepositorios({ ordemServico, consumos: [consumo], estoque });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(repos.estoquesRepository.existeMovimentacaoPorOrigem).toHaveBeenCalledWith({
      negocioId: "neg-1",
      referenciaTipo: "ORDEM_SERVICO",
      referenciaId: ordemServico.id,
      referenciaItemId: itemId,
      produtoId: "prod-1",
    });
  });

  it("permite baixa parcial explícita (realizado + insuficiente + já registrado)", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const shampoo = criarConsumo({
      produtoId: "prod-1",
      quantidade: 2,
      unidadeMedida: "UNIDADE",
    });
    const apc = criarConsumo({
      produtoId: "prod-2",
      quantidade: 5,
      unidadeMedida: "UNIDADE",
    });
    const pano = criarConsumo({
      produtoId: "prod-3",
      quantidade: 1,
      unidadeMedida: "UNIDADE",
    });
    const estoqueShampoo = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const estoqueApc = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-2",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 2,
    });

    // Comporta estoque por produto e duplicidade por produto.
    const buscarPorProduto = jest.fn().mockImplementation((_n: string, produtoId: string) => {
      if (produtoId === "prod-1") return Promise.resolve(estoqueShampoo);
      if (produtoId === "prod-2") return Promise.resolve(estoqueApc);
      return Promise.resolve(null);
    });
    const existeMovimentacaoPorOrigem = jest
      .fn()
      .mockImplementation((params: { produtoId?: string }) =>
        Promise.resolve(params.produtoId === "prod-3"),
      );
    const salvar = jest.fn().mockResolvedValue(undefined);
    const estoquesRepository = {
      buscarPorProduto,
      salvar,
      existeMovimentacaoPorOrigem,
    } as unknown as EstoqueInternoRepository;
    const produtosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as ProdutosRepository;

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      {
        buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      } as unknown as OrdensServicoRepository,
      {
        listarPorServico: jest.fn().mockResolvedValue([shampoo, apc, pano]),
      } as unknown as ConsumosInsumoServicoRepository,
      estoquesRepository,
      produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    // Shampoo baixado, APC insuficiente, microfibra já registrada.
    expect(resultado.realizados).toHaveLength(1);
    expect(resultado.realizados[0].produtoId).toBe("prod-1");
    expect(estoqueShampoo.quantidadeAtual).toBe(8);
    expect(resultado.insuficientes).toEqual([
      { produtoId: "prod-2", motivo: "Saldo insuficiente para baixar" },
    ]);
    expect(resultado.jaRegistrados).toEqual([{ produtoId: "prod-3" }]);
    // O estoque insuficiente não é corrompido nem salvo.
    expect(estoqueApc.quantidadeAtual).toBe(2);
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(estoqueShampoo);
  });

  it("baixa insumos ainda não registrados quando a origem não existe", async () => {
    const { ordemServico, itemId } = criarOsComItem();
    const consumo = criarConsumo({ quantidade: 2, unidadeMedida: "UNIDADE" });
    const estoque = EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repos = montarRepositorios({
      ordemServico,
      consumos: [consumo],
      estoque,
      salvar,
      jaRegistrado: false,
    });

    const useCase = new ConfirmarConsumoInsumosItemOSUseCase(
      repos.ordensServicoRepository,
      repos.consumosRepository,
      repos.estoquesRepository,
      repos.produtosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado.realizados).toHaveLength(1);
    expect(resultado.jaRegistrados).toEqual([]);
    expect(estoque.quantidadeAtual).toBe(8);
    expect(salvar).toHaveBeenCalledWith(estoque);
  });
});
