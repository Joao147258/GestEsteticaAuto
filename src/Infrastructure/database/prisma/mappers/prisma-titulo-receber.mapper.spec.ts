import { TituloFinanceiro } from "../../../../Domain/financeiro";
import { PrismaTituloReceberMapper } from "./prisma-titulo-receber.mapper";

// PrismaTituloReceberMapper.spec — valida a reconstrução do agregado
// TituloFinanceiro com parcelas e pagamentos, e a derivação do valorTotal.

describe("PrismaTituloReceberMapper", () => {
  const rawBase = {
    id: "tit-1",
    negocioId: "neg-1",
    origem: "ORCAMENTO",
    origemId: "orc-1",
    clienteId: "cli-1",
    fornecedorId: null,
    descricao: "Orçamento aprovado",
    valorOriginal: { toString: () => "300.0" },
    valorDesconto: { toString: () => "30.0" },
    valorAcrescimo: { toString: () => "0" },
    status: "ABERTO",
    dataEmissao: new Date("2026-01-01T10:00:00Z"),
    dataVencimento: new Date("2026-02-01T10:00:00Z"),
    observacoes: null,
    canceladoEm: null,
    motivoCancelamento: null,
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-01T10:00:00Z"),
  };

  const parcelaRaw = {
    id: "parc-1",
    tituloId: "tit-1",
    numero: 1,
    tipo: "SINAL",
    descricao: "Sinal",
    valorOriginal: { toString: () => "90.0" },
    status: "PAGA",
    dataVencimento: new Date("2026-01-05T10:00:00Z"),
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-05T10:00:00Z"),
    pagamentos: [
      {
        id: "pag-1",
        negocioId: "neg-1",
        tituloId: "tit-1",
        parcelaId: "parc-1",
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
        valor: { toString: () => "90.0" },
        status: "CONFIRMADO",
        dataPagamento: new Date("2026-01-05T10:00:00Z"),
        confirmadoEm: new Date("2026-01-05T10:05:00Z"),
        canceladoEm: null,
        motivoCancelamento: null,
        observacoes: null,
        criadoEm: new Date("2026-01-05T10:00:00Z"),
      },
    ],
  };

  describe("toDomain", () => {
    it("reconstrói o título com parcelas e pagamentos", () => {
      const titulo = PrismaTituloReceberMapper.toDomain({
        ...rawBase,
        parcelas: [parcelaRaw],
      } as any);

      expect(titulo).toBeInstanceOf(TituloFinanceiro);
      expect(titulo.id).toBe("tit-1");
      expect(titulo.origem).toBe("ORCAMENTO");
      expect(titulo.valorOriginal).toBe(300.0);
      expect(titulo.parcelas).toHaveLength(1);
      expect(titulo.parcelas[0].tipo).toBe("SINAL");
      expect(titulo.parcelas[0].valorPago).toBe(90.0);
    });

    it("deriva valorTotal de original - desconto + acréscimo", () => {
      const titulo = PrismaTituloReceberMapper.toDomain({
        ...rawBase,
        parcelas: [],
      } as any);

      expect(titulo.valorTotal).toBe(270.0);
    });

    it("mapeia origem/status desconhecidos para defaults", () => {
      const titulo = PrismaTituloReceberMapper.toDomain({
        ...rawBase,
        origem: "INVALIDO",
        status: "INVALIDO",
        parcelas: [],
      } as any);

      expect(titulo.origem).toBe("AVULSO");
      expect(titulo.status).toBe("ABERTO");
    });
  });

  describe("toPrisma", () => {
    it("converte o título para o formato do banco", () => {
      const titulo = PrismaTituloReceberMapper.toDomain({
        ...rawBase,
        parcelas: [parcelaRaw],
      } as any);

      const data = PrismaTituloReceberMapper.toPrisma(titulo);

      expect(data).toEqual({
        id: "tit-1",
        negocioId: "neg-1",
        origem: "ORCAMENTO",
        origemId: "orc-1",
        clienteId: "cli-1",
        fornecedorId: null,
        descricao: "Orçamento aprovado",
        valorOriginal: 300.0,
        valorDesconto: 30.0,
        valorAcrescimo: 0,
        status: "ABERTO",
        dataEmissao: titulo.dataEmissao,
        dataVencimento: titulo.dataVencimento,
        observacoes: null,
        canceladoEm: null,
        motivoCancelamento: null,
        criadoEm: titulo.criadoEm,
        atualizadoEm: titulo.atualizadoEm,
      });
    });
  });
});
