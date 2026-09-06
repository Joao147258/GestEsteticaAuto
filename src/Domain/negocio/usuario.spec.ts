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

    it("alterarSenhaHash atualiza e valida vazio", () => {
      const usuario = Usuario.criar({
        negocioId: "neg-1",
        nome: "João",
        email: "joao@email.com",
      });
      usuario.alterarSenhaHash("$2a$10$xyz");
      expect(usuario.senhaHash).toBe("$2a$10$xyz");
      expect(() => usuario.alterarSenhaHash("   ")).toThrow(NegocioError);
    });

    it("reconstituir remonta entidade existente com todos os atributos", () => {
      const agora = new Date();
      const usuario = Usuario.reconstituir({
        id: "usr-1",
        negocioId: "neg-1",
        nome: " João Dantas ",
        email: " joao@email.com ",
        senhaHash: "$2a$10$xyz",
        ativo: true,
        criadoEm: agora,
        atualizadoEm: agora,
      });

      expect(usuario.id).toBe("usr-1");
      expect(usuario.nome).toBe("João Dantas");
      expect(usuario.email).toBe("joao@email.com");
      expect(usuario.senhaHash).toBe("$2a$10$xyz");
      expect(usuario.ativo).toBe(true);
    });
  });
});
