import { PacoteServico } from "./pacote_servico";
import { CatalogoError } from "./CatalogoError";

describe("PacoteServico", () => {
  describe("criar", () => {
    it("cria pacote com precoPacote obrigatório e itens vazios", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "  Pacote completo  ",
        precoPacote: 500,
      });

      expect(pacote.id).toBeTruthy();
      expect(pacote.negocioId).toBe("neg-1");
      expect(pacote.nome).toBe("Pacote completo");
      expect(pacote.precoPacote).toBe(500);
      expect(pacote.itens).toEqual([]);
      expect(pacote.status).toBe("ATIVO");
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        PacoteServico.criar({ negocioId: "neg-1", nome: "  ", precoPacote: 100 }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando preço é negativo", () => {
      expect(() =>
        PacoteServico.criar({ negocioId: "neg-1", nome: "Pacote", precoPacote: -1 }),
      ).toThrow(CatalogoError);
    });
  });

  describe("itens", () => {
    it("adiciona item com servicoId e quantidade", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "Pacote",
        precoPacote: 500,
      });

      const itemId = pacote.adicionarItem({
        servicoId: "serv-1",
        descricao: "Lavagem detalhada",
        quantidade: 2,
      });

      expect(pacote.itens).toHaveLength(1);
      expect(pacote.itens[0].id).toBe(itemId);
      expect(pacote.itens[0].servicoId).toBe("serv-1");
      expect(pacote.itens[0].quantidade).toBe(2);
    });

    it("valida servicoId e quantidade do item", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "Pacote",
        precoPacote: 500,
      });

      expect(() =>
        pacote.adicionarItem({ servicoId: "  ", quantidade: 1 }),
      ).toThrow(CatalogoError);
      expect(() =>
        pacote.adicionarItem({ servicoId: "serv-1", quantidade: 0 }),
      ).toThrow(CatalogoError);
    });

    it("remove item existente", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "Pacote",
        precoPacote: 500,
      });
      const itemId = pacote.adicionarItem({
        servicoId: "serv-1",
        quantidade: 1,
      });

      pacote.removerItem(itemId);
      expect(pacote.itens).toHaveLength(0);
      expect(() => pacote.removerItem("nao-existe")).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    it("alterarPrecoPacote valida negativo", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "Pacote",
        precoPacote: 500,
      });
      pacote.alterarPrecoPacote(600);
      expect(pacote.precoPacote).toBe(600);
      expect(() => pacote.alterarPrecoPacote(-1)).toThrow(CatalogoError);
    });

    it("ativar e inativar", () => {
      const pacote = PacoteServico.criar({
        negocioId: "neg-1",
        nome: "Pacote",
        precoPacote: 500,
      });
      pacote.inativar();
      expect(pacote.status).toBe("INATIVO");
      pacote.ativar();
      expect(pacote.status).toBe("ATIVO");
    });
  });
});
