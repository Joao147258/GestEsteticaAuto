import { Orcamento, TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { OrcamentosRepository } from "../../comercial/repositories/OrcamentosRepository";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";
import { GerarTituloReceberUseCase } from "./gerar-titulo-receber.use-case";

describe("GerarTituloReceberUseCase", () => {
  function criarOrcamentoAceito() {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
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

  function montarInput(orcamentoId: string) {
    return {
      negocioId: "neg-1",
      origem: "ORCAMENTO" as const,
      origemId: orcamentoId,
      clienteId: "cli-1",
      descricao: "Serviço de estética",
      valorOriginal: 120,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA" as const,
          valorOriginal: 120,
          dataVencimento: new Date("2026-09-01"),
        },
      ],
    };
  }

  it("gera título a partir de orçamento aprovado e salva", async () => {
    const orcamento = criarOrcamentoAceito();
    const salvar = jest.fn().mockResolvedValue(undefined);
    const buscarPorOrigem = jest.fn().mockResolvedValue(null);

    const useCase = new GerarTituloReceberUseCase(
      {
        buscarPorOrigem,
        salvar,
      } as unknown as TitulosReceberRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    const resultado = await useCase.execute(montarInput(orcamento.id));

    expect(resultado).toBeInstanceOf(TituloFinanceiro);
    expect(resultado.origem).toBe("ORCAMENTO");
    expect(resultado.origemId).toBe(orcamento.id);
    expect(resultado.valorTotal).toBe(120);
    expect(resultado.status).toBe("ABERTO");
    expect(buscarPorOrigem).toHaveBeenCalledWith("neg-1", "ORCAMENTO", orcamento.id);
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(resultado);
  });

  it("é idempotente: retorna o título existente sem criar outro", async () => {
    const tituloExistente = TituloFinanceiro.criar({
      negocioId: "neg-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      clienteId: "cli-1",
      descricao: "Serviço de estética",
      valorOriginal: 120,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA",
          valorOriginal: 120,
          dataVencimento: new Date("2026-09-01"),
        },
      ],
    });
    const salvar = jest.fn();

    const useCase = new GerarTituloReceberUseCase(
      {
        buscarPorOrigem: jest.fn().mockResolvedValue(tituloExistente),
        salvar,
      } as unknown as TitulosReceberRepository,
      {} as unknown as OrcamentosRepository,
    );

    const resultado = await useCase.execute(montarInput("orc-1"));

    expect(resultado).toBe(tituloExistente);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("lança NotFoundError quando o orçamento não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new GerarTituloReceberUseCase(
      {
        buscarPorOrigem: jest.fn().mockResolvedValue(null),
        salvar,
      } as unknown as TitulosReceberRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(null),
      } as unknown as OrcamentosRepository,
    );

    await expect(useCase.execute(montarInput("orc-inexistente"))).rejects.toThrow(
      NotFoundError,
    );
    expect(salvar).not.toHaveBeenCalled();
  });

  it("lança ValidationError quando o orçamento não está aprovado e não salva", async () => {
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
    const salvar = jest.fn();

    const useCase = new GerarTituloReceberUseCase(
      {
        buscarPorOrigem: jest.fn().mockResolvedValue(null),
        salvar,
      } as unknown as TitulosReceberRepository,
      {
        buscarPorId: jest.fn().mockResolvedValue(orcamento),
      } as unknown as OrcamentosRepository,
    );

    await expect(useCase.execute(montarInput(orcamento.id))).rejects.toThrow(
      ValidationError,
    );
    expect(salvar).not.toHaveBeenCalled();
  });
});
