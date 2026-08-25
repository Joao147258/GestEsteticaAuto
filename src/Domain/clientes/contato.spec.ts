import { Contato } from "./contato";
import { ClienteError } from "./ClienteError";

describe("Contato", () => {
  describe("criar", () => {
    it("cria contato com tipo + valor normalizados", () => {
      const contato = Contato.criar({
        clienteId: "cli-1",
        nome: "  João  ",
        tipo: "WHATSAPP",
        valor: " (11) 99999-0000 ",
        principal: true,
      });

      expect(contato.id).toBeTruthy();
      expect(contato.clienteId).toBe("cli-1");
      expect(contato.nome).toBe("João");
      expect(contato.tipo).toBe("WHATSAPP");
      expect(contato.valor).toBe("(11) 99999-0000");
      expect(contato.principal).toBe(true);
      expect(contato.atualizadoEm).toBeInstanceOf(Date);
    });

    it("cria contato sem nome (opcional) e com principal false por padrão", () => {
      const contato = Contato.criar({
        clienteId: "cli-1",
        tipo: "EMAIL",
        valor: "cliente@email.com",
      });

      expect(contato.nome).toBeNull();
      expect(contato.principal).toBe(false);
    });

    it("lança ClienteError quando clienteId, tipo ou valor são inválidos", () => {
      expect(() =>
        Contato.criar({ clienteId: "  ", tipo: "EMAIL", valor: "x@y.com" }),
      ).toThrow(ClienteError);
      expect(() =>
        Contato.criar({
          clienteId: "cli-1",
          tipo: undefined as unknown as "EMAIL",
          valor: "x@y.com",
        }),
      ).toThrow(ClienteError);
      expect(() =>
        Contato.criar({ clienteId: "cli-1", tipo: "EMAIL", valor: "  " }),
      ).toThrow(ClienteError);
    });
  });

  describe("alterações", () => {
    function criarContato(): Contato {
      return Contato.criar({
        clienteId: "cli-1",
        tipo: "WHATSAPP",
        valor: "(11) 99999-0000",
      });
    }

    it("alterarNome aceita null e atualiza", () => {
      const contato = criarContato();
      contato.alterarNome("Maria");
      expect(contato.nome).toBe("Maria");
      contato.alterarNome(null);
      expect(contato.nome).toBeNull();
    });

    it("alterarTipo atualiza e valida", () => {
      const contato = criarContato();
      contato.alterarTipo("INSTAGRAM");
      expect(contato.tipo).toBe("INSTAGRAM");
      expect(() =>
        contato.alterarTipo(undefined as unknown as "INSTAGRAM"),
      ).toThrow(ClienteError);
    });

    it("alterarValor atualiza e valida vazio", () => {
      const contato = criarContato();
      contato.alterarValor("(11) 98888-1111");
      expect(contato.valor).toBe("(11) 98888-1111");
      expect(() => contato.alterarValor("  ")).toThrow(ClienteError);
    });

    it("alterarObservacoes aceita null", () => {
      const contato = criarContato();
      contato.alterarObservacoes("Contato comercial");
      expect(contato.observacoes).toBe("Contato comercial");
      contato.alterarObservacoes(null);
      expect(contato.observacoes).toBeNull();
    });

    it("definirComoPrincipal e removerComoPrincipal", () => {
      const contato = criarContato();
      contato.definirComoPrincipal();
      expect(contato.principal).toBe(true);
      contato.removerComoPrincipal();
      expect(contato.principal).toBe(false);
    });
  });
});
