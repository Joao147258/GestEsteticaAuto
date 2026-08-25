import { PreferenciaCliente } from "./preferencia_cliente";
import { ClienteError } from "./ClienteError";

describe("PreferenciaCliente", () => {
  describe("criar", () => {
    it("cria preferência com chave e valor normalizados", () => {
      const preferencia = PreferenciaCliente.criar({
        clienteId: "cli-1",
        chave: "  preferencia_contato  ",
        valor: "  WHATSAPP  ",
      });

      expect(preferencia.id).toBeTruthy();
      expect(preferencia.clienteId).toBe("cli-1");
      expect(preferencia.chave).toBe("preferencia_contato");
      expect(preferencia.valor).toBe("WHATSAPP");
      expect(preferencia.atualizadoEm).toBeInstanceOf(Date);
    });

    it("lança ClienteError quando clienteId, chave ou valor são inválidos", () => {
      expect(() =>
        PreferenciaCliente.criar({ clienteId: "  ", chave: "c", valor: "v" }),
      ).toThrow(ClienteError);
      expect(() =>
        PreferenciaCliente.criar({ clienteId: "cli-1", chave: "  ", valor: "v" }),
      ).toThrow(ClienteError);
      expect(() =>
        PreferenciaCliente.criar({ clienteId: "cli-1", chave: "c", valor: "  " }),
      ).toThrow(ClienteError);
    });
  });

  describe("alterações", () => {
    function criarPreferencia(): PreferenciaCliente {
      return PreferenciaCliente.criar({
        clienteId: "cli-1",
        chave: "preferencia_contato",
        valor: "WHATSAPP",
      });
    }

    it("alterarChave atualiza e valida vazio", () => {
      const preferencia = criarPreferencia();
      preferencia.alterarChave("horario_preferido");
      expect(preferencia.chave).toBe("horario_preferido");
      expect(() => preferencia.alterarChave("  ")).toThrow(ClienteError);
    });

    it("alterarValor atualiza e valida vazio", () => {
      const preferencia = criarPreferencia();
      preferencia.alterarValor("MANHA");
      expect(preferencia.valor).toBe("MANHA");
      expect(() => preferencia.alterarValor("  ")).toThrow(ClienteError);
    });

    it("alterarObservacoes aceita null", () => {
      const preferencia = criarPreferencia();
      preferencia.alterarObservacoes("Evitar cheiro forte");
      expect(preferencia.observacoes).toBe("Evitar cheiro forte");
      preferencia.alterarObservacoes(null);
      expect(preferencia.observacoes).toBeNull();
    });
  });
});
