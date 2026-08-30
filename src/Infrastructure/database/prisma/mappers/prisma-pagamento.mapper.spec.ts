import { Pagamento } from "../../../../Domain/financeiro";
import { PrismaPagamentoMapper } from "./prisma-pagamento.mapper";

// PrismaPagamentoMapper.spec — valida a conversão do pagamento entre Prisma
// e domínio.

describe("PrismaPagamentoMapper", () => {
  const rawBase = {
    id: "pag-1",
    negocioId: "neg-1",
    tituloId: "tit-1",
    parcelaId: "parc-1",
    formaPagamentoId: "fp-1",
    formaPagamentoDescricao: "PIX",
    valor: { toString: () => "100.0" },
    status: "CONFIRMADO",
    dataPagamento: new Date("2026-01-05T10:00:00Z"),
    confirmadoEm: new Date("2026-01-05T10:05:00Z"),
    canceladoEm: null,
    motivoCancelamento: null,
    observacoes: "Baixa via PIX",
    criadoEm: new Date("2026-01-05T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte os campos do domínio", () => {
      const pag = PrismaPagamentoMapper.toDomain(rawBase as any);

      expect(pag).toEqual(
        expect.objectContaining({
          id: "pag-1",
          negocioId: "neg-1",
          tituloFinanceiroId: "tit-1",
          parcelaFinanceiraId: "parc-1",
          valor: 100.0,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
          status: "CONFIRMADO",
          observacoes: "Baixa via PIX",
        }),
      );
    });

    it("mapeia status desconhecido para PENDENTE", () => {
      const pag = PrismaPagamentoMapper.toDomain({
        ...rawBase,
        status: "INVALIDO",
      } as any);

      expect(pag.status).toBe("PENDENTE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const pag = Pagamento.reconstituir({
        id: "pag-1",
        negocioId: "neg-1",
        tituloFinanceiroId: "tit-1",
        parcelaFinanceiraId: "parc-1",
        valor: 100.0,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
        dataPagamento: new Date("2026-01-05T10:00:00Z"),
        status: "CONFIRMADO",
        observacoes: "Baixa via PIX",
        criadoEm: new Date("2026-01-05T10:00:00Z"),
        confirmadoEm: new Date("2026-01-05T10:05:00Z"),
        canceladoEm: null,
        motivoCancelamento: null,
      });

      const data = PrismaPagamentoMapper.toPrisma(pag);

      expect(data).toEqual({
        id: "pag-1",
        negocioId: "neg-1",
        tituloId: "tit-1",
        parcelaId: "parc-1",
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
        valor: 100.0,
        status: "CONFIRMADO",
        dataPagamento: pag.dataPagamento,
        observacoes: "Baixa via PIX",
        criadoEm: pag.criadoEm,
        confirmadoEm: pag.confirmadoEm,
        canceladoEm: null,
        motivoCancelamento: null,
      });
    });
  });
});
