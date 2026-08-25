import { EstoqueInterno } from "./estoque_interno";
import { EstoqueInternoError } from "./EstoqueInternoError";

describe("EstoqueInterno", () => {
  // Helper padrão: estoque interno com 10 unidades.
  function criarEstoque(
    overrides: Partial<Parameters<typeof EstoqueInterno.criar>[0]> = {},
  ) {
    return EstoqueInterno.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
      ...overrides,
    });
  }

  describe("criar", () => {
    it("valida negócio, produto e unidade de medida obrigatórios", () => {
      expect(() =>
        EstoqueInterno.criar({ negocioId: "", produtoId: "p", unidadeMedida: "UNIDADE" }),
      ).toThrow(EstoqueInternoError);
      expect(() =>
        EstoqueInterno.criar({ negocioId: "n", produtoId: "", unidadeMedida: "UNIDADE" }),
      ).toThrow(EstoqueInternoError);
      expect(() =>
        EstoqueInterno.criar({
          negocioId: "n",
          produtoId: "p",
          unidadeMedida: undefined as unknown as "UNIDADE",
        }),
      ).toThrow(EstoqueInternoError);
    });

    it("lança EstoqueInternoError quando quantidade inicial é negativa", () => {
      expect(() => criarEstoque({ quantidadeInicial: -1 })).toThrow(
        EstoqueInternoError,
      );
    });

    it("lança EstoqueInternoError quando custo unitário aproximado é negativo", () => {
      expect(() => criarEstoque({ custoUnitarioAproximado: -5 })).toThrow(
        EstoqueInternoError,
      );
    });

    it("cria com saldo inicial registrando movimentação ENTRADA", () => {
      const estoque = criarEstoque();
      expect(estoque.quantidadeAtual).toBe(10);
      expect(estoque.movimentacoes).toHaveLength(1);
      expect(estoque.movimentacoes[0].tipo).toBe("ENTRADA");
      expect(estoque.movimentacoes[0].motivo).toBe("Saldo inicial");
      expect(estoque.movimentacoes[0].quantidadeAnterior).toBe(0);
      expect(estoque.movimentacoes[0].quantidadeNova).toBe(10);
    });
  });

  describe("adicionarEntrada", () => {
    it("incrementa o saldo e registra ENTRADA", () => {
      const estoque = criarEstoque();
      estoque.adicionarEntrada(5, "Compra");

      expect(estoque.quantidadeAtual).toBe(15);
      const ultima = estoque.movimentacoes.at(-1);
      expect(ultima?.tipo).toBe("ENTRADA");
      expect(ultima?.motivo).toBe("Compra");
      expect(ultima?.quantidadeNova).toBe(15);
    });

    it("lança EstoqueInternoError quando quantidade é zero", () => {
      const estoque = criarEstoque();
      expect(() => estoque.adicionarEntrada(0)).toThrow(EstoqueInternoError);
    });
  });

  describe("registrarSaidaInterna", () => {
    it("baixa o saldo e registra SAIDA_INTERNA", () => {
      const estoque = criarEstoque();
      estoque.registrarSaidaInterna(3, "Uso em carro");

      expect(estoque.quantidadeAtual).toBe(7);
      const ultima = estoque.movimentacoes.at(-1);
      expect(ultima?.tipo).toBe("SAIDA_INTERNA");
      expect(ultima?.motivo).toBe("Uso em carro");
    });

    it("lança EstoqueInternoError quando a saída supera o saldo", () => {
      const estoque = criarEstoque();
      expect(() => estoque.registrarSaidaInterna(20)).toThrow(EstoqueInternoError);
    });
  });

  describe("registrarPerda", () => {
    it("baixa o saldo e registra PERDA", () => {
      const estoque = criarEstoque();
      estoque.registrarPerda(2, "Frasco quebrado");

      expect(estoque.quantidadeAtual).toBe(8);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("PERDA");
    });

    it("lança EstoqueInternoError quando a perda supera o saldo", () => {
      const estoque = criarEstoque();
      expect(() => estoque.registrarPerda(15)).toThrow(EstoqueInternoError);
    });
  });

  describe("ajustarQuantidade", () => {
    it("ajusta o saldo e registra AJUSTE", () => {
      const estoque = criarEstoque();
      estoque.ajustarQuantidade(12);

      expect(estoque.quantidadeAtual).toBe(12);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("AJUSTE");
    });

    it("não registra movimentação quando o saldo não muda", () => {
      const estoque = criarEstoque();
      const antes = estoque.movimentacoes.length;
      estoque.ajustarQuantidade(10);
      expect(estoque.movimentacoes).toHaveLength(antes);
    });

    it("lança EstoqueInternoError para quantidade negativa", () => {
      const estoque = criarEstoque();
      expect(() => estoque.ajustarQuantidade(-1)).toThrow(EstoqueInternoError);
    });
  });
});
