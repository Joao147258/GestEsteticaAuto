import { CondicaoComercial } from "./condicao_comercial";
import { ComercialError } from "./ComercialError";

describe("CondicaoComercial", () => {
  function criarCondicao(
    overrides: Partial<Parameters<typeof CondicaoComercial.criar>[0]> = {},
  ) {
    return CondicaoComercial.criar({
      negocioId: "neg-1",
      politicaComercialId: "pol-1",
      formaPagamento: "PIX",
      ...overrides,
    });
  }

  describe("criar", () => {
    it("cria condição com padrões (1 parcela, sem repasse)", () => {
      const condicao = criarCondicao();

      expect(condicao.id).toBeTruthy();
      expect(condicao.negocioId).toBe("neg-1");
      expect(condicao.politicaComercialId).toBe("pol-1");
      expect(condicao.formaPagamento).toBe("PIX");
      expect(condicao.quantidadeParcelas).toBe(1); // default
      expect(condicao.repassarTaxaMaquininha).toBe(false); // default
      expect(condicao.status).toBe("ATIVA");
      expect(condicao.valorDesconto).toBeNull();
      expect(condicao.valorSinal).toBeNull();
    });

    it("valida campos obrigatórios e valores", () => {
      expect(() =>
        criarCondicao({ negocioId: "  " }),
      ).toThrow(ComercialError);
      expect(() =>
        criarCondicao({ formaPagamento: undefined as unknown as "PIX" }),
      ).toThrow(ComercialError);
      expect(() => criarCondicao({ quantidadeParcelas: 0 })).toThrow(
        ComercialError,
      );
      expect(() => criarCondicao({ valorSinal: -1 })).toThrow(ComercialError);
      expect(() => criarCondicao({ taxaMaquininhaPercentual: -1 })).toThrow(
        ComercialError,
      );
    });

    it("desconto com valor exige tipo definido", () => {
      expect(() => criarCondicao({ valorDesconto: 50 })).toThrow(ComercialError);
    });

    it("desconto percentual não pode passar de 100", () => {
      expect(() =>
        criarCondicao({ tipoDesconto: "PERCENTUAL", valorDesconto: 150 }),
      ).toThrow(ComercialError);
    });
  });

  describe("alterações", () => {
    it("alterarFormaPagamento atualiza e registra", () => {
      const condicao = criarCondicao();
      condicao.alterarFormaPagamento("CARTAO_CREDITO", 3);

      expect(condicao.formaPagamento).toBe("CARTAO_CREDITO");
      expect(condicao.quantidadeParcelas).toBe(3);
      expect(condicao.alteracoes.length).toBe(2);
    });

    it("alterarFormaPagamento valida entrada", () => {
      const condicao = criarCondicao();
      expect(() =>
        condicao.alterarFormaPagamento("" as never, 1),
      ).toThrow(ComercialError);
      expect(() =>
        condicao.alterarFormaPagamento("PIX", 0),
      ).toThrow(ComercialError);
    });

    it("alterarDesconto atualiza e ignora valor igual", () => {
      const condicao = criarCondicao({
        tipoDesconto: "PERCENTUAL",
        valorDesconto: 5,
      });
      const antes = condicao.alteracoes.length;

      condicao.alterarDesconto("PERCENTUAL", 8);
      expect(condicao.valorDesconto).toBe(8);
      expect(condicao.alteracoes.length).toBe(antes + 1);

      condicao.alterarDesconto("PERCENTUAL", 8); // mesmo valor
      expect(condicao.alteracoes.length).toBe(antes + 1);
    });

    it("alterarSinal atualiza e valida negativo", () => {
      const condicao = criarCondicao();
      condicao.alterarSinal(150);
      expect(condicao.valorSinal).toBe(150);
      expect(() => condicao.alterarSinal(-5)).toThrow(ComercialError);
    });

    it("alterarTaxaMaquininha atualiza e registra", () => {
      const condicao = criarCondicao();
      condicao.alterarTaxaMaquininha(true, 3.5);

      expect(condicao.repassarTaxaMaquininha).toBe(true);
      expect(condicao.taxaMaquininhaPercentual).toBe(3.5);
      expect(condicao.alteracoes.length).toBe(2);
    });

    it("alterarObservacao normaliza e valida", () => {
      const condicao = criarCondicao();
      condicao.alterarObservacao("  Pagamento em 2x na entrega  ");
      expect(condicao.observacao).toBe("Pagamento em 2x na entrega");
    });

    it("ativar e inativar", () => {
      const condicao = criarCondicao();
      condicao.inativar();
      expect(condicao.status).toBe("INATIVA");
      condicao.ativar();
      expect(condicao.status).toBe("ATIVA");
    });
  });
});
