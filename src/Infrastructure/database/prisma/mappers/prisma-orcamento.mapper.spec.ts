import { Orcamento } from "../../../../Domain/comercial";
import { PrismaOrcamentoMapper } from "./prisma-orcamento.mapper";

// PrismaOrcamentoMapper.spec — valida a reconstrução do agregado Orcamento:
// itens, aceite mais recente (relação 1-N) e campos monetários (Decimal).

describe("PrismaOrcamentoMapper", () => {
  const rawBase = {
    id: "orc-1",
    negocioId: "neg-1",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    numero: "0001",
    politicaComercialId: "pol-1",
    condicaoComercialId: "cond-1",
    status: "EM_ABERTO",
    observacoes: "Orçamento teste",
    subtotal: { toString: () => "250" },
    valorDesconto: { toString: () => "25" },
    valorAcrescimo: { toString: () => "0" },
    valorTotal: { toString: () => "225" },
    validoAte: new Date("2026-02-01T10:00:00Z"),
    validadeDias: 30,
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  const itemRaw = {
    id: "item-1",
    negocioId: "neg-1",
    orcamentoId: "orc-1",
    servicoId: "serv-1",
    produtoId: null,
    tipo: "SERVICO",
    descricao: "Polimento",
    quantidade: { toString: () => "1" },
    valorUnitario: { toString: () => "250" },
    valorTotal: { toString: () => "250" },
    desconto: { toString: () => "25" },
    observacoes: null,
    criadoEm: new Date("2026-01-01T11:00:00Z"),
    atualizadoEm: new Date("2026-01-01T11:00:00Z"),
  };

  describe("toDomain", () => {
    it("reconstrói o agregado com itens e valores decimais", () => {
      const orcamento = PrismaOrcamentoMapper.toDomain({
        ...rawBase,
        itens: [itemRaw],
        aceites: [],
      } as any);

      expect(orcamento).toBeInstanceOf(Orcamento);
      expect(orcamento.id).toBe("orc-1");
      expect(orcamento.politicaComercialId).toBe("pol-1");
      expect(orcamento.condicaoComercialId).toBe("cond-1");
      expect(orcamento.subtotal).toBe(250);
      expect(orcamento.valorDesconto).toBe(25);
      expect(orcamento.valorTotal).toBe(225);
      expect(orcamento.status).toBe("EM_ABERTO");
      expect(orcamento.validoAte?.toISOString()).toBe("2026-02-01T10:00:00.000Z");
      expect(orcamento.itens).toHaveLength(1);
      expect(orcamento.itens[0].tipo).toBe("SERVICO");
      expect(orcamento.itens[0].referenciaId).toBe("serv-1");
    });

    it("usa o aceite mais recente (maior criadoEm) na relação 1-N", () => {
      const aceiteAntigo = {
        id: "aceite-antigo",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        clienteId: "cli-1",
        status: "RECUSADO",
        canal: null,
        assinatura: null,
        aceitoEm: null,
        recusadoEm: new Date("2026-01-01T12:00:00Z"),
        observacoes: null,
        enviadoEm: null,
        expiradoEm: null,
        ip: null,
        criadoEm: new Date("2026-01-01T12:00:00Z"),
        atualizadoEm: new Date("2026-01-01T12:00:00Z"),
      };
      const aceiteRecente = {
        ...aceiteAntigo,
        id: "aceite-recente",
        status: "ACEITO",
        aceitoEm: new Date("2026-01-03T12:00:00Z"),
        recusadoEm: null,
        criadoEm: new Date("2026-01-03T12:00:00Z"),
        atualizadoEm: new Date("2026-01-03T12:00:00Z"),
      };

      const orcamento = PrismaOrcamentoMapper.toDomain({
        ...rawBase,
        itens: [],
        aceites: [aceiteAntigo, aceiteRecente],
      } as any);

      expect(orcamento.aceite?.id).toBe("aceite-recente");
      expect(orcamento.aceite?.status).toBe("ACEITO");
    });

    it("retorna aceite null quando não há registros", () => {
      const orcamento = PrismaOrcamentoMapper.toDomain({
        ...rawBase,
        itens: [],
        aceites: [],
      } as any);

      expect(orcamento.aceite).toBeNull();
    });
  });

  describe("toPrisma", () => {
    it("converte o orçamento para o formato do banco sem campos legados", () => {
      const orcamento = PrismaOrcamentoMapper.toDomain({
        ...rawBase,
        itens: [itemRaw],
        aceites: [],
      } as any);

      const data = PrismaOrcamentoMapper.toPrisma(orcamento);

      expect(data).toEqual({
        id: "orc-1",
        negocioId: "neg-1",
        clienteId: "cli-1",
        veiculoId: "vei-1",
        politicaComercialId: "pol-1",
        condicaoComercialId: "cond-1",
        status: "EM_ABERTO",
        observacoes: "Orçamento teste",
        subtotal: 250,
        valorDesconto: 25,
        valorAcrescimo: 0,
        valorTotal: 225,
        validoAte: new Date("2026-02-01T10:00:00Z"),
        criadoEm: orcamento.criadoEm,
        atualizadoEm: orcamento.atualizadoEm,
      });
      expect(data).not.toHaveProperty("numero");
      expect(data).not.toHaveProperty("validadeDias");
    });
  });
});
