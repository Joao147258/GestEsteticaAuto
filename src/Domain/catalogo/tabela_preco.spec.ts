import { TabelaPreco } from "./tabela_preco";
import { CatalogoError } from "./CatalogoError";

describe("TabelaPreco", () => {
  describe("criar", () => {
    it("cria tabela ATIVA com itens vazios", () => {
      const tabela = TabelaPreco.criar({
        negocioId: "neg-1",
        nome: "  Tabela padrão  ",
      });

      expect(tabela.id).toBeTruthy();
      expect(tabela.negocioId).toBe("neg-1");
      expect(tabela.nome).toBe("Tabela padrão");
      expect(tabela.ativa).toBe(true);
      expect(tabela.itens).toEqual([]);
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        TabelaPreco.criar({ negocioId: "neg-1", nome: "  " }),
      ).toThrow(CatalogoError);
    });
  });

  describe("itens", () => {
    it("adiciona item com referência, tipo e valor", () => {
      const tabela = TabelaPreco.criar({
        negocioId: "neg-1",
        nome: "Padrão",
      });

      const itemId = tabela.adicionarItem({
        referenciaId: "serv-1",
        tipoReferencia: "SERVICO",
        valor: 550,
      });

      expect(tabela.itens).toHaveLength(1);
      expect(tabela.itens[0].id).toBe(itemId);
      expect(tabela.itens[0].referenciaId).toBe("serv-1");
      expect(tabela.itens[0].tipoReferencia).toBe("SERVICO");
      expect(tabela.itens[0].valor).toBe(550);
    });

    it("valida referência, tipo e valor do item", () => {
      const tabela = TabelaPreco.criar({
        negocioId: "neg-1",
        nome: "Padrão",
      });

      expect(() =>
        tabela.adicionarItem({
          referenciaId: "  ",
          tipoReferencia: "PRODUTO",
          valor: 10,
        }),
      ).toThrow(CatalogoError);
      expect(() =>
        tabela.adicionarItem({
          referenciaId: "p-1",
          tipoReferencia: undefined as unknown as "PRODUTO",
          valor: 10,
        }),
      ).toThrow(CatalogoError);
      expect(() =>
        tabela.adicionarItem({
          referenciaId: "p-1",
          tipoReferencia: "PRODUTO",
          valor: -1,
        }),
      ).toThrow(CatalogoError);
    });

    it("remove item existente", () => {
      const tabela = TabelaPreco.criar({
        negocioId: "neg-1",
        nome: "Padrão",
      });
      const itemId = tabela.adicionarItem({
        referenciaId: "p-1",
        tipoReferencia: "PRODUTO",
        valor: 30,
      });

      tabela.removerItem(itemId);
      expect(tabela.itens).toHaveLength(0);
      expect(() => tabela.removerItem("nao-existe")).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const tabela = TabelaPreco.criar({ negocioId: "neg-1", nome: "Padrão" });
      tabela.alterarNome("Tabela vip");
      expect(tabela.nome).toBe("Tabela vip");
      expect(() => tabela.alterarNome("  ")).toThrow(CatalogoError);
    });

    it("ativar e inativar", () => {
      const tabela = TabelaPreco.criar({ negocioId: "neg-1", nome: "Padrão" });
      tabela.inativar();
      expect(tabela.ativa).toBe(false);
      tabela.ativar();
      expect(tabela.ativa).toBe(true);
    });
  });
});
