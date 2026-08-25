import { CategoriaServico } from "./categoria_servico";
import { CatalogoError } from "./CatalogoError";

describe("CategoriaServico", () => {
  describe("criar", () => {
    it("cria categoria ATIVA com nome normalizado", () => {
      const categoria = CategoriaServico.criar({
        negocioId: "neg-1",
        nome: "  Estética automotiva  ",
      });

      expect(categoria.id).toBeTruthy();
      expect(categoria.negocioId).toBe("neg-1");
      expect(categoria.nome).toBe("Estética automotiva");
      expect(categoria.ativa).toBe(true);
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        CategoriaServico.criar({ negocioId: "neg-1", nome: "  " }),
      ).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const categoria = CategoriaServico.criar({
        negocioId: "neg-1",
        nome: "Estética",
      });
      categoria.alterarNome("Preparação");
      expect(categoria.nome).toBe("Preparação");
      expect(() => categoria.alterarNome("  ")).toThrow(CatalogoError);
    });

    it("alterarDescricao aceita null", () => {
      const categoria = CategoriaServico.criar({
        negocioId: "neg-1",
        nome: "Estética",
      });
      categoria.alterarDescricao(null);
      expect(categoria.descricao).toBeNull();
    });

    it("ativar e inativar", () => {
      const categoria = CategoriaServico.criar({
        negocioId: "neg-1",
        nome: "Estética",
      });
      categoria.inativar();
      expect(categoria.ativa).toBe(false);
      categoria.ativar();
      expect(categoria.ativa).toBe(true);
    });
  });
});
