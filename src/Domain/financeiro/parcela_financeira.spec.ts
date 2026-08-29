import { ParcelaFinanceira } from "./parcela_financeira";
import { FinanceiroError } from "./FinanceiroError";

describe("ParcelaFinanceira", () => {
  function criarParcela(
    overrides: Partial<Parameters<typeof ParcelaFinanceira.criar>[0]> = {},
  ) {
    return ParcelaFinanceira.criar({
      tituloFinanceiroId: "tit-1",
      numero: 1,
      tipo: "PARCELA",
      valorOriginal: 100,
      dataVencimento: new Date("2026-10-10"),
      ...overrides,
    });
  }

  describe("criar", () => {
    it("cria parcela válida com padrões", () => {
      const parcela = criarParcela();

      expect(parcela.id).toBeTruthy();
      expect(parcela.tituloFinanceiroId).toBe("tit-1");
      expect(parcela.numero).toBe(1);
      expect(parcela.tipo).toBe("PARCELA");
      expect(parcela.valorOriginal).toBe(100);
      expect(parcela.valorPago).toBe(0);
      expect(parcela.saldoAberto).toBe(100);
      expect(parcela.status).toBe("PENDENTE");
    });

    it("não permite valor zero ou negativo", () => {
      expect(() => criarParcela({ valorOriginal: 0 })).toThrow(FinanceiroError);
      expect(() => criarParcela({ valorOriginal: -10 })).toThrow(FinanceiroError);
    });

    it("não permite tipo inválido", () => {
      expect(() => criarParcela({ tipo: "INVALIDO" as never })).toThrow(
        FinanceiroError,
      );
    });

    it("não permite número menor ou igual a zero", () => {
      expect(() => criarParcela({ numero: 0 })).toThrow(FinanceiroError);
    });

    it("não permite vencimento ausente", () => {
      expect(() =>
        criarParcela({ dataVencimento: undefined as unknown as Date }),
      ).toThrow(FinanceiroError);
    });
  });

  describe("pagamentos e status", () => {
    it("fica PENDENTE sem pagamento confirmado", () => {
      const parcela = criarParcela();
      expect(parcela.status).toBe("PENDENTE");
    });

    it("ignora pagamento pendente no cálculo de quitação", () => {
      const parcela = criarParcela();
      parcela.registrarPagamento("neg-1", {
        valor: 100,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });

      expect(parcela.valorPago).toBe(0);
      expect(parcela.saldoAberto).toBe(100);
      expect(parcela.status).toBe("PENDENTE");
    });

    it("fica PARCIALMENTE_PAGA com pagamento parcial confirmado", () => {
      const parcela = criarParcela();
      const pagamentoId = parcela.registrarPagamento("neg-1", {
        valor: 40,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      parcela.confirmarPagamento(pagamentoId);

      expect(parcela.valorPago).toBe(40);
      expect(parcela.saldoAberto).toBe(60);
      expect(parcela.status).toBe("PARCIALMENTE_PAGA");
    });

    it("fica PAGA com pagamento total confirmado", () => {
      const parcela = criarParcela();
      const pagamentoId = parcela.registrarPagamento("neg-1", {
        valor: 100,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      parcela.confirmarPagamento(pagamentoId);

      expect(parcela.valorPago).toBe(100);
      expect(parcela.saldoAberto).toBe(0);
      expect(parcela.status).toBe("PAGA");
      expect(parcela.dataPagamento).toBeInstanceOf(Date);
    });

    it("ignora pagamento cancelado no cálculo de quitação", () => {
      const parcela = criarParcela();
      const pagamentoId = parcela.registrarPagamento("neg-1", {
        valor: 100,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      parcela.cancelarPagamento(pagamentoId, "lançamento errado");

      expect(parcela.valorPago).toBe(0);
      expect(parcela.saldoAberto).toBe(100);
      expect(parcela.status).toBe("PENDENTE");
    });

    it("não permite receber pagamento acima do saldo", () => {
      const parcela = criarParcela();
      expect(() =>
        parcela.registrarPagamento("neg-1", {
          valor: 150,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
        }),
      ).toThrow(FinanceiroError);
    });

    it("não permite receber pagamento em parcela cancelada", () => {
      const parcela = criarParcela();
      parcela.cancelar();
      expect(parcela.status).toBe("CANCELADA");

      expect(() =>
        parcela.registrarPagamento("neg-1", {
          valor: 50,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
        }),
      ).toThrow(FinanceiroError);
    });

    it("não permite valor de pagamento zero ou negativo", () => {
      const parcela = criarParcela();
      expect(() =>
        parcela.registrarPagamento("neg-1", {
          valor: 0,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
        }),
      ).toThrow(FinanceiroError);
      expect(() =>
        parcela.registrarPagamento("neg-1", {
          valor: -5,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
        }),
      ).toThrow(FinanceiroError);
    });
  });

  describe("cancelamento e vencimento", () => {
    it("não permite cancelar parcela paga", () => {
      const parcela = criarParcela();
      const pagamentoId = parcela.registrarPagamento("neg-1", {
        valor: 100,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      parcela.confirmarPagamento(pagamentoId);

      expect(() => parcela.cancelar()).toThrow(FinanceiroError);
    });

    it("não permite cancelar parcela já cancelada", () => {
      const parcela = criarParcela();
      parcela.cancelar();
      expect(() => parcela.cancelar()).toThrow(FinanceiroError);
    });

    it("identifica vencimento por data", () => {
      const parcela = criarParcela({ dataVencimento: new Date("2026-09-01") });
      parcela.verificarVencimento(new Date("2026-09-02"));
      expect(parcela.status).toBe("VENCIDA");
    });

    it("não marca vencida se já paga ou data atual antes do vencimento", () => {
      const parcela = criarParcela({ dataVencimento: new Date("2026-09-10") });
      parcela.verificarVencimento(new Date("2026-09-01"));
      expect(parcela.status).toBe("PENDENTE");
    });
  });
});
