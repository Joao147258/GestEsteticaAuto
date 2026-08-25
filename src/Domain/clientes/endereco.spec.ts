import { Endereco } from "./endereco";
import { ClienteError } from "./ClienteError";

describe("Endereco", () => {
  describe("criar", () => {
    it("cria endereço com campos normalizados e principal false por padrão", () => {
      const endereco = Endereco.criar({
        clienteId: "cli-1",
        cidade: "  São Paulo  ",
        estado: "  SP  ",
        logradouro: " Rua A ",
      });

      expect(endereco.id).toBeTruthy();
      expect(endereco.clienteId).toBe("cli-1");
      expect(endereco.cidade).toBe("São Paulo");
      expect(endereco.estado).toBe("SP");
      expect(endereco.logradouro).toBe("Rua A");
      expect(endereco.principal).toBe(false);
      expect(endereco.atualizadoEm).toBeInstanceOf(Date);
    });

    it("aceita cadastro parcial (apenas um campo)", () => {
      const endereco = Endereco.criar({
        clienteId: "cli-1",
        bairro: "Centro",
      });

      expect(endereco.bairro).toBe("Centro");
      expect(endereco.cidade).toBeNull();
      expect(endereco.estado).toBeNull();
    });

    it("lança ClienteError quando endereço é totalmente vazio", () => {
      expect(() =>
        Endereco.criar({ clienteId: "cli-1" }),
      ).toThrow(ClienteError);
      expect(() =>
        Endereco.criar({ clienteId: "cli-1", cidade: "  " }),
      ).toThrow(ClienteError);
    });
  });

  describe("alterações", () => {
    function criarEndereco(): Endereco {
      return Endereco.criar({
        clienteId: "cli-1",
        cidade: "São Paulo",
        estado: "SP",
      });
    }

    it("alterarCidade e alterarEstado aceitam null", () => {
      const endereco = criarEndereco();
      endereco.alterarCidade("Campinas");
      expect(endereco.cidade).toBe("Campinas");

      endereco.alterarEstado(null);
      expect(endereco.estado).toBeNull();
    });

    it("alterarCep e alterarLogradouro aceitam null", () => {
      const endereco = criarEndereco();
      endereco.alterarCep("01001-000");
      expect(endereco.cep).toBe("01001-000");
      endereco.alterarCep(null);
      expect(endereco.cep).toBeNull();
    });

    it("alterarObservacoes aceita null", () => {
      const endereco = criarEndereco();
      endereco.alterarObservacoes("Ponto de referência: praça");
      expect(endereco.observacoes).toBe("Ponto de referência: praça");
      endereco.alterarObservacoes(null);
      expect(endereco.observacoes).toBeNull();
    });

    it("definirComoPrincipal e removerComoPrincipal", () => {
      const endereco = criarEndereco();
      endereco.definirComoPrincipal();
      expect(endereco.principal).toBe(true);
      endereco.removerComoPrincipal();
      expect(endereco.principal).toBe(false);
    });
  });
});
