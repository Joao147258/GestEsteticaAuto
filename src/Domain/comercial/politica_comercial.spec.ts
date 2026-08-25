import { PoliticaComercial } from "./politica_comercial";
import { CondicaoComercial } from "./condicao_comercial";
import { ComercialError } from "./ComercialError";

describe("PoliticaComercial", () => {
  function regraPadrao() {
    return {
      forma: "PIX" as const,
      ativa: true,
      permiteParcelamento: false,
      quantidadeMaximaParcelas: 1,
      descontoAVistaPercentual: 5,
      repassarTaxaMaquininha: false,
      taxaMaquininhaPercentual: null,
      exigeSinal: false,
      percentualMinimoSinal: null,
    };
  }

  function criarPolitica(
    overrides: Partial<Parameters<typeof PoliticaComercial.criar>[0]> = {},
  ) {
    return PoliticaComercial.criar({
      negocioId: "neg-1",
      nome: "Política padrão",
      descontoMaximoPercentual: 10,
      prazoValidadeDias: 7,
      formasPagamento: [regraPadrao()],
      ...overrides,
    });
  }

  describe("criar", () => {
    it("cria política ATIVA com regras copiadas", () => {
      const politica = criarPolitica();

      expect(politica.id).toBeTruthy();
      expect(politica.negocioId).toBe("neg-1");
      expect(politica.nome).toBe("Política padrão");
      expect(politica.status).toBe("ATIVA");
      expect(politica.descontoMaximoPercentual).toBe(10);
      expect(politica.prazoValidadeDias).toBe(7);
      expect(politica.formasPagamento).toHaveLength(1);
      expect(politica.alteracoes).toHaveLength(0);
    });

    it("valida nome, desconto e prazo", () => {
      expect(() => criarPolitica({ nome: "  " })).toThrow(ComercialError);
      expect(() => criarPolitica({ descontoMaximoPercentual: -1 })).toThrow(
        ComercialError,
      );
      expect(() => criarPolitica({ descontoMaximoPercentual: 150 })).toThrow(
        ComercialError,
      );
      expect(() => criarPolitica({ prazoValidadeDias: 0 })).toThrow(ComercialError);
    });

    it("exige ao menos uma forma de pagamento", () => {
      expect(() => criarPolitica({ formasPagamento: [] })).toThrow(ComercialError);
    });

    it("valida regra: forma sem parcelamento não pode ter mais de 1 parcela", () => {
      expect(() =>
        criarPolitica({
          formasPagamento: [
            { ...regraPadrao(), permiteParcelamento: false, quantidadeMaximaParcelas: 3 },
          ],
        }),
      ).toThrow(ComercialError);
    });
  });

  describe("status e regras", () => {
    it("ativar e inativar registram alteração", () => {
      const politica = criarPolitica();
      politica.inativar();
      expect(politica.status).toBe("INATIVA");
      expect(politica.alteracoes.at(-1)?.campo).toBe("status");

      politica.ativar();
      expect(politica.status).toBe("ATIVA");
    });

    it("adicionarRegraFormaPagamento e rejeita duplicada", () => {
      const politica = criarPolitica();
      politica.adicionarRegraFormaPagamento({
        ...regraPadrao(),
        forma: "CARTAO_CREDITO",
        permiteParcelamento: true,
        quantidadeMaximaParcelas: 3,
      });

      expect(politica.formasPagamento).toHaveLength(2);
      expect(() =>
        politica.adicionarRegraFormaPagamento(regraPadrao()),
      ).toThrow(ComercialError);
    });

    it("removerRegraFormaPagamento exige ao menos uma restante", () => {
      const politica = criarPolitica();
      expect(() => politica.removerRegraFormaPagamento("PIX")).toThrow(
        ComercialError,
      );
    });

    it("permiteFormaPagamento respeita o flag ativa", () => {
      const politica = criarPolitica();
      expect(politica.permiteFormaPagamento("PIX")).toBe(true);

      politica.adicionarRegraFormaPagamento({
        ...regraPadrao(),
        forma: "CARTAO_CREDITO",
        ativa: false,
        permiteParcelamento: true,
        quantidadeMaximaParcelas: 3,
      });
      expect(politica.permiteFormaPagamento("CARTAO_CREDITO")).toBe(false);
    });
  });

  describe("validarCondicao", () => {
    function criarCondicao(
      overrides: Partial<Parameters<typeof CondicaoComercial.criar>[0]> = {},
    ) {
      return CondicaoComercial.criar({
        negocioId: "neg-1",
        politicaComercialId: "pol-1",
        formaPagamento: "PIX",
        quantidadeParcelas: 1,
        ...overrides,
      });
    }

    it("aceita condição dentro dos limites", () => {
      const politica = criarPolitica();
      const condicao = criarCondicao();

      expect(() => politica.validarCondicao(condicao, 500)).not.toThrow();
    });

    it("rejeita forma de pagamento não permitida", () => {
      const politica = criarPolitica();
      const condicao = criarCondicao({ formaPagamento: "BOLETO" });

      expect(() => politica.validarCondicao(condicao, 500)).toThrow(
        ComercialError,
      );
    });

    it("rejeita parcelas acima do permitido", () => {
      const politica = criarPolitica();
      politica.adicionarRegraFormaPagamento({
        ...regraPadrao(),
        forma: "CARTAO_CREDITO",
        permiteParcelamento: true,
        quantidadeMaximaParcelas: 3,
      });
      const condicao = criarCondicao({
        formaPagamento: "CARTAO_CREDITO",
        quantidadeParcelas: 6,
      });

      expect(() => politica.validarCondicao(condicao, 500)).toThrow(
        ComercialError,
      );
    });

    it("rejeita desconto percentual acima do máximo", () => {
      const politica = criarPolitica(); // máximo 10%
      const condicao = criarCondicao({
        tipoDesconto: "PERCENTUAL",
        valorDesconto: 15,
      });

      expect(() => politica.validarCondicao(condicao, 500)).toThrow(
        ComercialError,
      );
    });

    it("rejeita sinal abaixo do mínimo exigido", () => {
      const politica = criarPolitica({
        formasPagamento: [
          {
            ...regraPadrao(),
            exigeSinal: true,
            percentualMinimoSinal: 30,
          },
        ],
      });
      const condicao = criarCondicao({ valorSinal: 50 }); // 10% de 500

      expect(() => politica.validarCondicao(condicao, 500)).toThrow(
        ComercialError,
      );
    });

    it("rejeita repasse de taxa de maquininha não permitido", () => {
      const politica = criarPolitica(); // repassarTaxaMaquininha false
      const condicao = criarCondicao({ repassarTaxaMaquininha: true });

      expect(() => politica.validarCondicao(condicao, 500)).toThrow(
        ComercialError,
      );
    });
  });
});
