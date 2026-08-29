import { Pagamento } from "./pagamento";
import { FinanceiroError } from "./FinanceiroError";

describe("Pagamento", () => {
  function criarPagamento(
    overrides: Partial<Parameters<typeof Pagamento.criar>[0]> = {},
  ) {
    return Pagamento.criar({
      negocioId: "neg-1",
      tituloFinanceiroId: "tit-1",
      parcelaFinanceiraId: "par-1",
      valor: 100,
      formaPagamentoId: "fp-1",
      formaPagamentoDescricao: "PIX",
      ...overrides,
    });
  }

  describe("criar", () => {
    it("cria pagamento válido como PENDENTE", () => {
      const pagamento = criarPagamento();

      expect(pagamento.id).toBeTruthy();
      expect(pagamento.negocioId).toBe("neg-1");
      expect(pagamento.tituloFinanceiroId).toBe("tit-1");
      expect(pagamento.parcelaFinanceiraId).toBe("par-1");
      expect(pagamento.valor).toBe(100);
      expect(pagamento.formaPagamentoId).toBe("fp-1");
      expect(pagamento.formaPagamentoDescricao).toBe("PIX");
      expect(pagamento.status).toBe("PENDENTE");
      expect(pagamento.confirmadoEm).toBeNull();
      expect(pagamento.canceladoEm).toBeNull();
    });

    it("não permite valor zero ou negativo", () => {
      expect(() => criarPagamento({ valor: 0 })).toThrow(FinanceiroError);
      expect(() => criarPagamento({ valor: -10 })).toThrow(FinanceiroError);
    });

    it("valida campos obrigatórios", () => {
      expect(() => criarPagamento({ negocioId: "" })).toThrow(FinanceiroError);
      expect(() =>
        criarPagamento({ tituloFinanceiroId: "" }),
      ).toThrow(FinanceiroError);
      expect(() =>
        criarPagamento({ parcelaFinanceiraId: "" }),
      ).toThrow(FinanceiroError);
      expect(() => criarPagamento({ formaPagamentoId: "" })).toThrow(
        FinanceiroError,
      );
    });
  });

  describe("ciclo de vida", () => {
    it("confirma pagamento (PENDENTE → CONFIRMADO)", () => {
      const pagamento = criarPagamento();
      pagamento.confirmar();

      expect(pagamento.status).toBe("CONFIRMADO");
      expect(pagamento.confirmadoEm).toBeInstanceOf(Date);
    });

    it("confirmação é idempotente", () => {
      const pagamento = criarPagamento();
      pagamento.confirmar();
      pagamento.confirmar();
      expect(pagamento.status).toBe("CONFIRMADO");
    });

    it("cancela pagamento com motivo", () => {
      const pagamento = criarPagamento();
      pagamento.cancelar("lançamento errado");

      expect(pagamento.status).toBe("CANCELADO");
      expect(pagamento.canceladoEm).toBeInstanceOf(Date);
      expect(pagamento.motivoCancelamento).toBe("lançamento errado");
    });

    it("não permite cancelar pagamento sem motivo", () => {
      const pagamento = criarPagamento();
      expect(() => pagamento.cancelar("  ")).toThrow(FinanceiroError);
    });

    it("não permite cancelar pagamento já cancelado", () => {
      const pagamento = criarPagamento();
      pagamento.cancelar("lançamento errado");
      expect(() => pagamento.cancelar("outro motivo")).toThrow(FinanceiroError);
    });

    it("não permite confirmar pagamento cancelado", () => {
      const pagamento = criarPagamento();
      pagamento.cancelar("lançamento errado");
      expect(() => pagamento.confirmar()).toThrow(FinanceiroError);
    });
  });
});
