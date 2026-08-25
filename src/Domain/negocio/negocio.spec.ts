import { Negocio } from "./negocio";
import { NegocioError } from "./NegocioError";

describe("Negocio", () => {
  describe("criar", () => {
    it("cria negócio com nome normalizado e ativo", () => {
      const negocio = Negocio.criar({
        nome: "  AutoLavagem JD  ",
        cnpj: " 12.345.678/0001-90 ",
        email: " contato@autojd.com.br ",
      });

      expect(negocio.id).toBeTruthy();
      expect(negocio.nome).toBe("AutoLavagem JD");
      expect(negocio.cnpj).toBe("12.345.678/0001-90");
      expect(negocio.email).toBe("contato@autojd.com.br");
      expect(negocio.ativo).toBe(true);
    });

    it("lança NegocioError quando nome é vazio", () => {
      expect(() => Negocio.criar({ nome: "  " })).toThrow(NegocioError);
    });
  });

  describe("alterações", () => {
    it("alterarNome atualiza e valida vazio", () => {
      const negocio = Negocio.criar({ nome: "AutoLavagem" });
      negocio.alterarNome("AutoLavagem Premium");
      expect(negocio.nome).toBe("AutoLavagem Premium");
      expect(() => negocio.alterarNome("  ")).toThrow(NegocioError);
    });

    it("alterarDocumento aceita null", () => {
      const negocio = Negocio.criar({ nome: "AutoLavagem" });
      negocio.alterarDocumento(null);
      expect(negocio.cnpj).toBeNull();
    });

    it("ativar e inativar", () => {
      const negocio = Negocio.criar({ nome: "AutoLavagem" });
      negocio.inativar();
      expect(negocio.ativo).toBe(false);
      negocio.ativar();
      expect(negocio.ativo).toBe(true);
    });
  });
});
