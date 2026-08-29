import { FormaPagamento } from "./forma_pagamento";
import { FinanceiroError } from "./FinanceiroError";

describe("FormaPagamento", () => {
  function criarForma(
    overrides: Partial<Parameters<typeof FormaPagamento.criar>[0]> = {},
  ) {
    return FormaPagamento.criar({
      negocioId: "neg-1",
      nome: "PIX",
      tipo: "PIX",
      ...overrides,
    });
  }

  describe("criar", () => {
    it("cria forma de pagamento válida e ATIVA", () => {
      const forma = criarForma();

      expect(forma.id).toBeTruthy();
      expect(forma.negocioId).toBe("neg-1");
      expect(forma.nome).toBe("PIX");
      expect(forma.tipo).toBe("PIX");
      expect(forma.status).toBe("ATIVA");
      expect(forma.exigeConfirmacaoManual).toBe(false);
    });

    it("não permite nome vazio", () => {
      expect(() => criarForma({ nome: "" })).toThrow(FinanceiroError);
      expect(() => criarForma({ nome: "   " })).toThrow(FinanceiroError);
    });

    it("não permite negócio vazio", () => {
      expect(() => criarForma({ negocioId: "" })).toThrow(FinanceiroError);
    });
  });

  describe("ciclo de vida", () => {
    it("permite inativar forma de pagamento", () => {
      const forma = criarForma();
      forma.inativar();
      expect(forma.status).toBe("INATIVA");
    });

    it("permite ativar forma de pagamento", () => {
      const forma = criarForma();
      forma.inativar();
      forma.ativar();
      expect(forma.status).toBe("ATIVA");
    });

    it("inativar e ativar são idempotentes", () => {
      const forma = criarForma();
      forma.inativar();
      forma.inativar();
      expect(forma.status).toBe("INATIVA");
      forma.ativar();
      forma.ativar();
      expect(forma.status).toBe("ATIVA");
    });

    it("configura exigência de confirmação manual", () => {
      const forma = criarForma();
      forma.alterarExigeConfirmacaoManual(true);
      expect(forma.exigeConfirmacaoManual).toBe(true);
    });

    it("permite criar forma com exigeConfirmacaoManual", () => {
      const forma = criarForma({ exigeConfirmacaoManual: true });
      expect(forma.exigeConfirmacaoManual).toBe(true);
    });
  });
});
