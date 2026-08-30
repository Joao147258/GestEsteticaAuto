import { Orcamento, OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { OrcamentosRepository } from "../../comercial/repositories/OrcamentosRepository";
import { OrcamentoNaoAprovadoError } from "../errors/OrcamentoNaoAprovadoError";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { GerarOrdemServicoUseCase } from "./gerar-ordem-servico.use-case";

describe("GerarOrdemServicoUseCase", () => {
  function criarOrcamentoAceito(veiculoId: string | null = "vei-1") {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: veiculoId ?? undefined,
    });
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Lavagem detalhada",
      quantidade: 1,
      valorUnitario: 120,
    });
    orcamento.abrir();
    orcamento.aceitar();
    return orcamento;
  }

  it("gera uma OS a partir de orçamento aprovado e salva", async () => {
    const orcamento = criarOrcamentoAceito();
    const salvar = jest.fn().mockResolvedValue(undefined);
    const buscarPorOrcamento = jest.fn().mockResolvedValue(null);

    const useCase = new GerarOrdemServicoUseCase(
      {
        buscarPorOrcamento,
        salvar,
      } as unknown as OrdensServicoRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
    });

    expect(resultado).toBeInstanceOf(OrdemServico);
    expect(resultado.negocioId).toBe("neg-1");
    expect(resultado.clienteId).toBe("cli-1");
    expect(resultado.veiculoId).toBe("vei-1");
    expect(resultado.orcamentoId).toBe(orcamento.id);
    expect(resultado.status).toBe("ABERTA");
    // Itens do orçamento viram itens da OS (servicoId = referenciaId).
    expect(resultado.itens).toHaveLength(1);
    expect(resultado.itens[0].servicoId).toBe("serv-1");
    expect(resultado.itens[0].descricao).toBe("Lavagem detalhada");
    expect(buscarPorOrcamento).toHaveBeenCalledWith("neg-1", orcamento.id);
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(resultado);
  });

  it("lança NotFoundError quando o orçamento não existe", async () => {
    const useCase = new GerarOrdemServicoUseCase(
      {} as unknown as OrdensServicoRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(null),
      } as unknown as OrcamentosRepository,
    );

    await expect(
      useCase.execute({ negocioId: "neg-1", orcamentoId: "orc-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("lança OrcamentoNaoAprovadoError quando o orçamento não está aceito", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Lavagem",
      quantidade: 1,
      valorUnitario: 120,
    });
    orcamento.abrir();

    const useCase = new GerarOrdemServicoUseCase(
      {
        salvar: jest.fn(),
      } as unknown as OrdensServicoRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    await expect(
      useCase.execute({ negocioId: "neg-1", orcamentoId: orcamento.id }),
    ).rejects.toThrow(OrcamentoNaoAprovadoError);
  });

  it("é idempotente: retorna a OS existente sem criar outra", async () => {
    const orcamento = criarOrcamentoAceito();
    const osExistente = OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      orcamentoId: orcamento.id,
    });
    const salvar = jest.fn();

    const useCase = new GerarOrdemServicoUseCase(
      {
        buscarPorOrcamento: jest.fn().mockResolvedValue(osExistente),
        salvar,
      } as unknown as OrdensServicoRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
    });

    expect(resultado).toBe(osExistente);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("lança ValidationError quando o orçamento não possui veículo", async () => {
    const orcamento = criarOrcamentoAceito(null);
    const salvar = jest.fn();

    const useCase = new GerarOrdemServicoUseCase(
      {
        buscarPorOrcamento: jest.fn().mockResolvedValue(null),
        salvar,
      } as unknown as OrdensServicoRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    await expect(
      useCase.execute({ negocioId: "neg-1", orcamentoId: orcamento.id }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
