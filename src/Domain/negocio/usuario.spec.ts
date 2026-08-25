import { Usuario } from "./usuario";
import { NegocioError } from "./NegocioError";

describe("Usuario", () => {
  describe("criar", () => {
    it("cria usuário com nome e email normalizados e ativo", () => {
      const usuario = Usuario.criar({
        negocioId: "neg-1",
        nome: "  João Dantas  ",
        email: "  joao@email.com ",
      });

      expect(usuario.id).toBeTruthy();
      expect(usuario.negocioId).toBe("neg-1");
      expect(usuario.nome).toBe("João Dantas");
      expect(usuario.email).toBe("joao@email.com");
      expect(usuario.ativo).toBe(true);
      // Sem autenticação nesta etapa — campo mantido para evolução futura.
      expect(usuario.senhaHash).toBe("");
    });

    it("lança NegocioError quando nome é vazio", () => {
      expect(() =>
        Usuario.criar({ negocioId: "neg-1", nome: "  ", email: "joao@email.com" }),
      ).toThrow(NegocioError);
    });

    it("lança NegocioError quando email é vazio", () => {
      expect(() =>
        Usuario.criar({ negocioId: "neg-1", nome: "João", email: "  " }),
      ).toThrow(NegocioError);
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const usuario = Usuario.criar({
        negocioId: "neg-1",
        nome: "João",
        email: "joao@email.com",
      });
      usuario.alterarNome("João Souza");
      expect(usuario.nome).toBe("João Souza");
      expect(() => usuario.alterarNome("  ")).toThrow(NegocioError);
    });

    it("alterarEmail atualiza e valida vazio", () => {
      const usuario = Usuario.criar({
        negocioId: "neg-1",
        nome: "João",
        email: "joao@email.com",
      });
      usuario.alterarEmail("novo@email.com");
      expect(usuario.email).toBe("novo@email.com");
      expect(() => usuario.alterarEmail("  ")).toThrow(NegocioError);
    });

    it("ativar e inativar", () => {
      const usuario = Usuario.criar({
        negocioId: "neg-1",
        nome: "João",
        email: "joao@email.com",
      });
      usuario.inativar();
      expect(usuario.ativo).toBe(false);
      usuario.ativar();
      expect(usuario.ativo).toBe(true);
    });
  });
});
