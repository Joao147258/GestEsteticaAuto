import { OrigemCliente } from "./origem_cliente";
import { ClienteError } from "./ClienteError";

describe("OrigemCliente", () => {
  describe("criar", () => {
    it("cria origem com nome normalizado e datas", () => {
      const origem = OrigemCliente.criar({
        negocioId: "neg-1",
        nome: "  Instagram  ",
        descricao: " Redes sociais ",
      });

      expect(origem.id).toBeTruthy();
      expect(origem.negocioId).toBe("neg-1");
      expect(origem.nome).toBe("Instagram");
      expect(origem.descricao).toBe("Redes sociais");
      expect(origem.ativo).toBe(true);
      expect(origem.criadoEm).toBeInstanceOf(Date);
      expect(origem.atualizadoEm).toBeInstanceOf(Date);
    });

    it("lança ClienteError quando nome é vazio", () => {
      expect(() => OrigemCliente.criar({ negocioId: "neg-1", nome: "  " })).toThrow(
        ClienteError,
      );
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const origem = OrigemCliente.criar({ negocioId: "neg-1", nome: "Google" });
      origem.alterarNome("Indicação");
      expect(origem.nome).toBe("Indicação");
      expect(() => origem.alterarNome("  ")).toThrow(ClienteError);
    });

    it("alterarDescricao atualiza e aceita null", () => {
      const origem = OrigemCliente.criar({ negocioId: "neg-1", nome: "Google" });
      origem.alterarDescricao("Busca orgânica");
      expect(origem.descricao).toBe("Busca orgânica");
      origem.alterarDescricao(null);
      expect(origem.descricao).toBeNull();
    });

    it("ativar e inativar atualizam atualizadoEm", () => {
      const origem = OrigemCliente.criar({ negocioId: "neg-1", nome: "Google" });
      origem.inativar();
      expect(origem.ativo).toBe(false);
      origem.ativar();
      expect(origem.ativo).toBe(true);
    });
  });
});
