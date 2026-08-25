import { CategoriaProduto } from "./categoria_produto";
import { CatalogoError } from "./CatalogoError";

describe("CategoriaProduto", () => {
  describe("criar", () => {
    it("cria categoria ATIVA com nome normalizado", () => {
      const categoria = CategoriaProduto.criar({
        negocioId: "neg-1",
        nome: "  Produtos de limpeza  ",
      });

      expect(categoria.id).toBeTruthy();
      expect(categoria.negocioId).toBe("neg-1");
      expect(categoria.nome).toBe("Produtos de limpeza");
      expect(categoria.ativa).toBe(true);
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        CategoriaProduto.criar({ negocioId: "neg-1", nome: "  " }),
      ).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const categoria = CategoriaProduto.criar({
        negocioId: "neg-1",
        nome: "Limpeza",
      });
      categoria.alterarNome("Lavagem");
      expect(categoria.nome).toBe("Lavagem");
      expect(() => categoria.alterarNome("  ")).toThrow(CatalogoError);
    });

    it("alterarDescricao aceita null", () => {
      const categoria = CategoriaProduto.criar({
        negocioId: "neg-1",
        nome: "Limpeza",
      });
      categoria.alterarDescricao(null);
      expect(categoria.descricao).toBeNull();
    });

    it("ativar e inativar", () => {
      const categoria = CategoriaProduto.criar({
        negocioId: "neg-1",
        nome: "Limpeza",
      });
      categoria.inativar();
      expect(categoria.ativa).toBe(false);
      categoria.ativar();
      expect(categoria.ativa).toBe(true);
    });
  });
});
