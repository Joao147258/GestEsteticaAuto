import { TituloFinanceiro } from "./titulo_financeiro";
import { FinanceiroError } from "./FinanceiroError";

describe("TituloFinanceiro", () => {
  function criarTitulo(
    overrides: Partial<Parameters<typeof TituloFinanceiro.criar>[0]> = {},
  ) {
    return TituloFinanceiro.criar({
      negocioId: "neg-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      clienteId: "cli-1",
      descricao: "Lavagem detalhada",
      valorOriginal: 100,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA",
          valorOriginal: 100,
          dataVencimento: new Date("2026-10-10"),
        },
      ],
      ...overrides,
    });
  }

  // Helper que confirma um pagamento recém-registrado na parcela alvo.
  function registrarEConfirmar(
    titulo: TituloFinanceiro,
    parcelaId: string,
    valor: number,
  ): void {
    const pagamentoId = titulo.registrarPagamento({
      parcelaFinanceiraId: parcelaId,
      valor,
      formaPagamentoId: "fp-1",
      formaPagamentoDescricao: "PIX",
    });
    titulo.confirmarPagamento(pagamentoId);
  }

  describe("criar", () => {
    it("cria título financeiro válido com uma parcela", () => {
      const titulo = criarTitulo();

      expect(titulo.id).toBeTruthy();
      expect(titulo.negocioId).toBe("neg-1");
      expect(titulo.origem).toBe("ORCAMENTO");
      expect(titulo.origemId).toBe("orc-1");
      expect(titulo.clienteId).toBe("cli-1");
      expect(titulo.descricao).toBe("Lavagem detalhada");
      expect(titulo.valorOriginal).toBe(100);
      expect(titulo.valorDesconto).toBe(0);
      expect(titulo.valorAcrescimo).toBe(0);
      expect(titulo.valorTotal).toBe(100);
      expect(titulo.status).toBe("ABERTO");
      expect(titulo.parcelas).toHaveLength(1);
    });

    it("cria título válido com sinal + parcela", () => {
      const titulo = criarTitulo({
        valorOriginal: 500,
        parcelas: [
          {
            numero: 1,
            tipo: "SINAL",
            descricao: "Sinal / Entrada",
            valorOriginal: 150,
            dataVencimento: new Date("2026-09-01"),
          },
          {
            numero: 2,
            tipo: "PARCELA",
            descricao: "Restante",
            valorOriginal: 350,
            dataVencimento: new Date("2026-10-01"),
          },
        ],
      });

      expect(titulo.parcelas).toHaveLength(2);
      const sinal = titulo.parcelas.find((p) => p.tipo === "SINAL");
      expect(sinal?.descricao).toBe("Sinal / Entrada");
      expect(sinal?.valorOriginal).toBe(150);
      expect(titulo.valorTotal).toBe(500);
    });

    it("não permite título sem parcelas", () => {
      expect(() => criarTitulo({ parcelas: [] })).toThrow(FinanceiroError);
    });

    it("não permite soma das parcelas diferente do valor total", () => {
      expect(() =>
        criarTitulo({
          parcelas: [
            {
              numero: 1,
              tipo: "PARCELA",
              valorOriginal: 90,
              dataVencimento: new Date("2026-10-10"),
            },
          ],
        }),
      ).toThrow(FinanceiroError);
    });

    it("não permite mais de uma parcela do tipo SINAL", () => {
      expect(() =>
        criarTitulo({
          valorOriginal: 500,
          parcelas: [
            {
              numero: 1,
              tipo: "SINAL",
              valorOriginal: 100,
              dataVencimento: new Date("2026-09-01"),
            },
            {
              numero: 2,
              tipo: "SINAL",
              valorOriginal: 400,
              dataVencimento: new Date("2026-10-01"),
            },
          ],
        }),
      ).toThrow(FinanceiroError);
    });

    it("valida campos obrigatórios", () => {
      expect(() => criarTitulo({ negocioId: "" })).toThrow(FinanceiroError);
      expect(() =>
        criarTitulo({ origem: undefined as never }),
      ).toThrow(FinanceiroError);
      expect(() => criarTitulo({ descricao: "" })).toThrow(FinanceiroError);
      expect(() => criarTitulo({ valorOriginal: 0 })).toThrow(FinanceiroError);
    });
  });

  describe("status", () => {
    it("recalcula status para ABERTO quando todas as parcelas pendentes", () => {
      const titulo = criarTitulo();
      expect(titulo.status).toBe("ABERTO");
    });

    it("recalcula status para PARCIALMENTE_PAGO com pagamento parcial", () => {
      const titulo = criarTitulo();
      const parcela = titulo.parcelas[0];
      registrarEConfirmar(titulo, parcela.id, 40);

      expect(titulo.status).toBe("PARCIALMENTE_PAGO");
      expect(titulo.saldoAberto).toBe(60);
    });

    it("recalcula status para PAGO quando todas as parcelas pagas", () => {
      const titulo = criarTitulo();
      const parcela = titulo.parcelas[0];
      registrarEConfirmar(titulo, parcela.id, 100);

      expect(titulo.status).toBe("PAGO");
      expect(titulo.saldoAberto).toBe(0);
    });

    it("marca VENCIDO quando parcela venceu sem quitação", () => {
      const titulo = criarTitulo({
        parcelas: [
          {
            numero: 1,
            tipo: "PARCELA",
            valorOriginal: 100,
            dataVencimento: new Date("2026-09-01"),
          },
        ],
      });
      expect(titulo.status).toBe("ABERTO");

      titulo.verificarVencimento(new Date("2026-09-02"));

      expect(titulo.parcelas[0].status).toBe("VENCIDA");
      expect(titulo.status).toBe("VENCIDO");
    });
  });

  describe("cancelamento", () => {
    it("cancela título sem pagamento confirmado", () => {
      const titulo = criarTitulo();
      titulo.cancelar("cliente desistiu");

      expect(titulo.status).toBe("CANCELADO");
      expect(titulo.canceladoEm).toBeInstanceOf(Date);
      expect(titulo.motivoCancelamento).toBe("cliente desistiu");
    });

    it("não cancela título com pagamento confirmado", () => {
      const titulo = criarTitulo();
      const parcela = titulo.parcelas[0];
      registrarEConfirmar(titulo, parcela.id, 100);

      expect(() => titulo.cancelar("cliente desistiu")).toThrow(
        FinanceiroError,
      );
    });

    it("não cancela título já cancelado", () => {
      const titulo = criarTitulo();
      titulo.cancelar("cliente desistiu");
      expect(() => titulo.cancelar("novo motivo")).toThrow(FinanceiroError);
    });

    it("exige motivo para cancelar", () => {
      const titulo = criarTitulo();
      expect(() => titulo.cancelar("  ")).toThrow(FinanceiroError);
    });

    it("não recebe pagamento após cancelamento", () => {
      const titulo = criarTitulo();
      titulo.cancelar("cliente desistiu");
      const parcela = titulo.parcelas[0];

      expect(() =>
        titulo.registrarPagamento({
          parcelaFinanceiraId: parcela.id,
          valor: 50,
          formaPagamentoId: "fp-1",
          formaPagamentoDescricao: "PIX",
        }),
      ).toThrow(FinanceiroError);
    });
  });

  describe("histórico", () => {
    it("registra histórico em criação e em pagamento", () => {
      const titulo = criarTitulo();
      expect(titulo.historico.length).toBe(1);
      expect(titulo.historico[0].tipo).toBe("CRIACAO");

      const parcela = titulo.parcelas[0];
      const pagamentoId = titulo.registrarPagamento({
        parcelaFinanceiraId: parcela.id,
        valor: 40,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      titulo.confirmarPagamento(pagamentoId);

      const tipos = titulo.historico.map((h) => h.tipo);
      expect(tipos).toContain("PAGAMENTO_REGISTRADO");
      expect(titulo.historico.length).toBeGreaterThan(1);
    });

    it("registra histórico no cancelamento", () => {
      const titulo = criarTitulo();
      titulo.cancelar("cliente desistiu");

      const cancelamento = titulo.historico.find((h) => h.tipo === "CANCELAMENTO");
      expect(cancelamento).toBeTruthy();
      expect(cancelamento?.descricao).toBe("cliente desistiu");
    });

    it("registra histórico no cancelamento de pagamento", () => {
      const titulo = criarTitulo();
      const parcela = titulo.parcelas[0];
      const pagamentoId = titulo.registrarPagamento({
        parcelaFinanceiraId: parcela.id,
        valor: 40,
        formaPagamentoId: "fp-1",
        formaPagamentoDescricao: "PIX",
      });
      titulo.cancelarPagamento(pagamentoId, "lançamento errado");

      const cancelamento = titulo.historico.find(
        (h) => h.tipo === "PAGAMENTO_CANCELADO",
      );
      expect(cancelamento).toBeTruthy();
    });
  });
});
