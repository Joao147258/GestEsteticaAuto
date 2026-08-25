import { TagCliente } from "./tag_cliente";
import { ClienteError } from "./ClienteError";

describe("TagCliente", () => {
  describe("criar", () => {
    it("cria tag com nome normalizado e datas", () => {
      const tag = TagCliente.criar({ negocioId: "neg-1", nome: "  VIP  " });

      expect(tag.id).toBeTruthy();
      expect(tag.negocioId).toBe("neg-1");
      expect(tag.nome).toBe("VIP");
      expect(tag.cor).toBeNull();
      expect(tag.ativo).toBe(true);
      expect(tag.criadoEm).toBeInstanceOf(Date);
      expect(tag.atualizadoEm).toBeInstanceOf(Date);
    });

    it("lança ClienteError quando nome é vazio", () => {
      expect(() => TagCliente.criar({ negocioId: "neg-1", nome: "  " })).toThrow(
        ClienteError,
      );
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const tag = TagCliente.criar({ negocioId: "neg-1", nome: "VIP" });
      tag.alterarNome("Premium");
      expect(tag.nome).toBe("Premium");
      expect(() => tag.alterarNome("  ")).toThrow(ClienteError);
    });

    it("alterarCor atualiza e aceita null", () => {
      const tag = TagCliente.criar({ negocioId: "neg-1", nome: "VIP" });
      tag.alterarCor("#FF0000");
      expect(tag.cor).toBe("#FF0000");
      tag.alterarCor(null);
      expect(tag.cor).toBeNull();
    });

    it("ativar e inativar", () => {
      const tag = TagCliente.criar({ negocioId: "neg-1", nome: "VIP" });
      tag.inativar();
      expect(tag.ativo).toBe(false);
      tag.ativar();
      expect(tag.ativo).toBe(true);
    });
  });
});
