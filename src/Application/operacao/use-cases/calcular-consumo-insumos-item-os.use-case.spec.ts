import { ConsumoInsumoServico, OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ConsumosInsumoServicoRepository } from "../../catalogo/repositories/consumos-insumo-servico.repository";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { CalcularConsumoInsumosItemOSUseCase } from "./calcular-consumo-insumos-item-os.use-case";

describe("CalcularConsumoInsumosItemOSUseCase", () => {
  function criarOsComItem(
    servicoId: string | null = "serv-1",
  ): { ordemServico: OrdemServico; itemId: string } {
    const os = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const itemId = os.adicionarItem({
      servicoId: servicoId ?? undefined,
      descricao: "Lavagem detalhada",
    });
    return { ordemServico: os, itemId };
  }

  it("retorna os insumos configurados para o serviço do item", async () => {
    const { ordemServico, itemId } = criarOsComItem("serv-1");
    const consumo1 = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 50,
      unidadeMedida: "ML",
    });
    const consumo2 = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-2",
      quantidade: 2,
      unidadeMedida: "UNIDADE",
    });
    const listarPorServico = jest.fn().mockResolvedValue([consumo1, consumo2]);
    const repositorios = {
      ordensServicoRepository: {
        buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      } as unknown as OrdensServicoRepository,
      consumosRepository: {
        listarPorServico,
      } as unknown as ConsumosInsumoServicoRepository,
    };

    const useCase = new CalcularConsumoInsumosItemOSUseCase(
      repositorios.ordensServicoRepository,
      repositorios.consumosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado).toEqual([
      { produtoId: "prod-1", quantidadePrevista: 50, unidadeMedida: "ML" },
      { produtoId: "prod-2", quantidadePrevista: 2, unidadeMedida: "UNIDADE" },
    ]);
    expect(listarPorServico).toHaveBeenCalledWith("neg-1", "serv-1");
  });

  it("não altera estoque (operação apenas de leitura/cálculo)", async () => {
    const { ordemServico, itemId } = criarOsComItem("serv-1");
    const consumo = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 50,
      unidadeMedida: "ML",
    });
    const listarPorServico = jest.fn().mockResolvedValue([consumo]);
    const repositorios = {
      ordensServicoRepository: {
        buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      } as unknown as OrdensServicoRepository,
      consumosRepository: {
        listarPorServico,
      } as unknown as ConsumosInsumoServicoRepository,
    };

    const useCase = new CalcularConsumoInsumosItemOSUseCase(
      repositorios.ordensServicoRepository,
      repositorios.consumosRepository,
    );
    await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    // Nenhum método de escrita é acionado no fluxo de cálculo.
    expect(listarPorServico).toHaveBeenCalledTimes(1);
  });

  it("retorna lista vazia quando o item não possui serviço associado", async () => {
    const { ordemServico, itemId } = criarOsComItem(null);

    const repositorios = {
      ordensServicoRepository: {
        buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      } as unknown as OrdensServicoRepository,
      consumosRepository: {
        listarPorServico: jest.fn(),
      } as unknown as ConsumosInsumoServicoRepository,
    };

    const useCase = new CalcularConsumoInsumosItemOSUseCase(
      repositorios.ordensServicoRepository,
      repositorios.consumosRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      ordemServicoId: ordemServico.id,
      itemOrdemServicoId: itemId,
    });

    expect(resultado).toEqual([]);
    expect(repositorios.consumosRepository.listarPorServico).not.toHaveBeenCalled();
  });

  it("lança NotFoundError quando a ordem de serviço não existe", async () => {
    const repositorios = {
      ordensServicoRepository: {
        buscarPorId: jest.fn().mockResolvedValue(null),
      } as unknown as OrdensServicoRepository,
      consumosRepository: {} as unknown as ConsumosInsumoServicoRepository,
    };

    const useCase = new CalcularConsumoInsumosItemOSUseCase(
      repositorios.ordensServicoRepository,
      repositorios.consumosRepository,
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
    const { ordemServico } = criarOsComItem("serv-1");
    const repositorios = {
      ordensServicoRepository: {
        buscarPorId: jest.fn().mockResolvedValue(ordemServico),
      } as unknown as OrdensServicoRepository,
      consumosRepository: {} as unknown as ConsumosInsumoServicoRepository,
    };

    const useCase = new CalcularConsumoInsumosItemOSUseCase(
      repositorios.ordensServicoRepository,
      repositorios.consumosRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        ordemServicoId: ordemServico.id,
        itemOrdemServicoId: "item-inexistente",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
