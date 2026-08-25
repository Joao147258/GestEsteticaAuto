import { Produto } from "./produto";
import { CatalogoError } from "./CatalogoError";

describe("Produto", () => {
  describe("criar", () => {
    it("cria produto com custo/preço separados e status ATIVO", () => {
      const produto = Produto.criar({
        negocioId: "neg-1",
        nome: "  Cera premium  ",
        tipoUso: "INSUMO_INTERNO",
        unidadeMedida: "CAIXA",
        custoReferencia: 45.5,
        precoVendaSugerido: 89.9,
        observacoes: "Cera de carnaúba",
      });

      expect(produto.id).toBeTruthy();
      expect(produto.negocioId).toBe("neg-1");
      expect(produto.nome).toBe("Cera premium");
      expect(produto.tipoUso).toBe("INSUMO_INTERNO");
      expect(produto.unidadeMedida).toBe("CAIXA");
      expect(produto.custoReferencia).toBe(45.5);
      expect(produto.precoVendaSugerido).toBe(89.9);
      expect(produto.observacoes).toBe("Cera de carnaúba");
      expect(produto.status).toBe("ATIVO");
      expect(produto.alteracoes).toEqual([]);
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        Produto.criar({
          negocioId: "neg-1",
          nome: "  ",
          tipoUso: "PRODUTO_VENDA",
          unidadeMedida: "UNIDADE",
        }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando tipoUso é ausente", () => {
      expect(() =>
        Produto.criar({
          negocioId: "neg-1",
          nome: "Cera",
          tipoUso: undefined as unknown as "INSUMO_INTERNO",
          unidadeMedida: "UNIDADE",
        }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando unidadeMedida é ausente", () => {
      expect(() =>
        Produto.criar({
          negocioId: "neg-1",
          nome: "Cera",
          tipoUso: "INSUMO_INTERNO",
          unidadeMedida: undefined as unknown as "UNIDADE",
        }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando custo ou preço sugerido são negativos", () => {
      expect(() =>
        Produto.criar({
          negocioId: "neg-1",
          nome: "Cera",
          tipoUso: "INSUMO_INTERNO",
          unidadeMedida: "UNIDADE",
          custoReferencia: -1,
        }),
      ).toThrow(CatalogoError);
      expect(() =>
        Produto.criar({
          negocioId: "neg-1",
          nome: "Cera",
          tipoUso: "INSUMO_INTERNO",
          unidadeMedida: "UNIDADE",
          precoVendaSugerido: -5,
        }),
      ).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    function criarProduto(): Produto {
      return Produto.criar({
        negocioId: "neg-1",
        nome: "Cera",
        tipoUso: "AMBOS",
        unidadeMedida: "UNIDADE",
        custoReferencia: 40,
        precoVendaSugerido: 89.9,
      });
    }

    it("atualizarNome atualiza e registra alteração com autor", () => {
      const produto = criarProduto();
      produto.atualizarNome("Cera premium v2", "func-1");

      expect(produto.nome).toBe("Cera premium v2");
      expect(produto.alteracoes[0]).toMatchObject({
        campo: "nome",
        valorAnterior: "Cera",
        valorNovo: "Cera premium v2",
        alteradoPor: "func-1",
      });
    });

    it("atualizarNome lança quando nome é vazio", () => {
      const produto = criarProduto();
      expect(() => produto.atualizarNome("  ")).toThrow(CatalogoError);
    });

    it("atualizarDescricao aceita null", () => {
      const produto = criarProduto();
      produto.atualizarDescricao(null);
      expect(produto.descricao).toBeNull();
    });

    it("alterarCategoria e alterarTipoUso", () => {
      const produto = criarProduto();
      produto.alterarCategoria("cat-1");
      expect(produto.categoriaId).toBe("cat-1");

      produto.alterarTipoUso("PRODUTO_VENDA");
      expect(produto.tipoUso).toBe("PRODUTO_VENDA");
      expect(() =>
        produto.alterarTipoUso(undefined as unknown as "PRODUTO_VENDA"),
      ).toThrow(CatalogoError);
    });

    it("alterarUnidadeMedida atualiza e valida", () => {
      const produto = criarProduto();
      produto.alterarUnidadeMedida("LITRO");
      expect(produto.unidadeMedida).toBe("LITRO");
    });

    it("atualizarCustoReferencia e atualizarPrecoVendaSugerido validam negativo", () => {
      const produto = criarProduto();
      produto.atualizarCustoReferencia(50);
      expect(produto.custoReferencia).toBe(50);
      expect(() => produto.atualizarCustoReferencia(-1)).toThrow(CatalogoError);

      produto.atualizarPrecoVendaSugerido(99.9);
      expect(produto.precoVendaSugerido).toBe(99.9);
      expect(() => produto.atualizarPrecoVendaSugerido(-1)).toThrow(
        CatalogoError,
      );
    });

    it("ativar e inativar registram alteração", () => {
      const produto = criarProduto();
      produto.inativar();
      expect(produto.status).toBe("INATIVO");
      expect(produto.alteracoes.at(-1)?.campo).toBe("status");

      produto.ativar();
      expect(produto.status).toBe("ATIVO");
    });
  });
});
