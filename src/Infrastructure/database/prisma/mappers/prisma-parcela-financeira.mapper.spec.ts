import { ParcelaFinanceira } from "../../../../Domain/financeiro";
import { PrismaParcelaFinanceiraMapper } from "./prisma-parcela-financeira.mapper";

// PrismaParcelaFinanceiraMapper.spec — valida a conversão da parcela e a
// derivação de valorPago/saldoAberto/dataPagamento a partir dos pagamentos.

describe("PrismaParcelaFinanceiraMapper", () => {
  const pagamentoConfirmado = {
    id: "pag-1",
    negocioId: "neg-1",
    tituloId: "tit-1",
    parcelaId: "parc-1",
    formaPagamentoId: "fp-1",
    formaPagamentoDescricao: "PIX",
    valor: { toString: () => "60.0" },
    status: "CONFIRMADO",
    dataPagamento: new Date("2026-01-05T10:00:00Z"),
    confirmadoEm: new Date("2026-01-05T10:05:00Z"),
    canceladoEm: null,
    motivoCancelamento: null,
    observacoes: null,
    criadoEm: new Date("2026-01-05T10:00:00Z"),
  };

  const rawBase = {
    id: "parc-1",
    tituloId: "tit-1",
    numero: 1,
    tipo: "PARCELA",
    descricao: "1ª parcela",
    valorOriginal: { toString: () => "100.0" },
    status: "PARCIALMENTE_PAGA",
    dataVencimento: new Date("2026-02-01T10:00:00Z"),
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-05T10:05:00Z"),
  };

  describe("toDomain", () => {
    it("deriva valorPago e saldoAberto dos pagamentos confirmados", () => {
      const parcela = PrismaParcelaFinanceiraMapper.toDomain({
        ...rawBase,
        pagamentos: [pagamentoConfirmado],
      } as any);

      expect(parcela.valorOriginal).toBe(100.0);
      expect(parcela.valorPago).toBe(60.0);
      expect(parcela.saldoAberto).toBe(40.0);
      expect(parcela.status).toBe("PARCIALMENTE_PAGA");
    });

    it("define dataPagamento quando a parcela está quitada", () => {
      const parcela = PrismaParcelaFinanceiraMapper.toDomain({
        ...rawBase,
        status: "PAGA",
        pagamentos: [{ ...pagamentoConfirmado, valor: { toString: () => "100.0" } }],
      } as any);

      expect(parcela.valorPago).toBe(100.0);
      expect(parcela.saldoAberto).toBe(0);
      expect(parcela.dataPagamento?.toISOString()).toBe("2026-01-05T10:00:00.000Z");
    });

    it("sem pagamentos, valorPago 0 e dataPagamento null", () => {
      const parcela = PrismaParcelaFinanceiraMapper.toDomain({
        ...rawBase,
        status: "PENDENTE",
        pagamentos: [],
      } as any);

      expect(parcela.valorPago).toBe(0);
      expect(parcela.saldoAberto).toBe(100.0);
      expect(parcela.dataPagamento).toBeNull();
    });
  });

  describe("toPrisma", () => {
    it("converte a parcela para o formato do banco", () => {
      const parcela = ParcelaFinanceira.reconstituir({
        id: "parc-1",
        tituloFinanceiroId: "tit-1",
        numero: 1,
        tipo: "PARCELA",
        descricao: "1ª parcela",
        valorOriginal: 100.0,
        valorPago: 60.0,
        saldoAberto: 40.0,
        dataVencimento: new Date("2026-02-01T10:00:00Z"),
        dataPagamento: null,
        status: "PARCIALMENTE_PAGA",
        pagamentos: [],
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-05T10:05:00Z"),
      });

      const data = PrismaParcelaFinanceiraMapper.toPrisma(parcela);

      expect(data).toEqual({
        id: "parc-1",
        tituloId: "tit-1",
        numero: 1,
        tipo: "PARCELA",
        descricao: "1ª parcela",
        valorOriginal: 100.0,
        status: "PARCIALMENTE_PAGA",
        dataVencimento: parcela.dataVencimento,
        criadoEm: parcela.criadoEm,
        atualizadoEm: parcela.atualizadoEm,
      });
    });
  });
});
