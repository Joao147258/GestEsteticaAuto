import { Cliente } from "./cliente";
import { ClienteError } from "./ClienteError";

describe("Cliente (agregado raiz do domínio de clientes)", () => {
  describe("criar", () => {
    it("cria cliente com status ATIVO, listas vazias e campos normalizados", () => {
      const cliente = Cliente.criar({
        negocioId: "neg-1",
        nome: "  João da Silva  ",
        tipo: "PESSOA_FISICA",
        telefone: " (11) 99999-0000 ",
        email: "  joao@email.com ",
      });

      expect(cliente.id).toBeTruthy();
      expect(cliente.negocioId).toBe("neg-1");
      expect(cliente.nome).toBe("João da Silva");
      expect(cliente.tipo).toBe("PESSOA_FISICA");
      expect(cliente.telefone).toBe("(11) 99999-0000");
      expect(cliente.email).toBe("joao@email.com");
      expect(cliente.status).toBe("ATIVO");
      expect(cliente.contatos).toEqual([]);
      expect(cliente.enderecos).toEqual([]);
      expect(cliente.preferencias).toEqual([]);
      expect(cliente.tags).toEqual([]);
      expect(cliente.anexos).toEqual([]);
      expect(cliente.alteracoes).toEqual([]);
      expect(cliente.criadoEm).toBeInstanceOf(Date);
      expect(cliente.atualizadoEm).toBeInstanceOf(Date);
    });

    it("cria cliente sem telefone (campo opcional)", () => {
      const cliente = Cliente.criar({
        negocioId: "neg-1",
        nome: "João",
        tipo: "PESSOA_FISICA",
      });

      expect(cliente.telefone).toBeNull();
      expect(cliente.documento).toBeNull();
    });

    it("lança ClienteError quando nome é vazio", () => {
      expect(() =>
        Cliente.criar({ negocioId: "neg-1", nome: "   ", tipo: "PESSOA_FISICA" }),
      ).toThrow(ClienteError);
    });

    it("lança ClienteError quando tipo é ausente", () => {
      expect(() =>
        Cliente.criar({
          negocioId: "neg-1",
          nome: "João",
          tipo: undefined as unknown as "PESSOA_FISICA",
        }),
      ).toThrow(ClienteError);
    });

    it("lança ClienteError quando negocioId é vazio", () => {
      expect(() =>
        Cliente.criar({ negocioId: "  ", nome: "João", tipo: "PESSOA_FISICA" }),
      ).toThrow(ClienteError);
    });
  });

  describe("alterações de dados principais", () => {
    function criarCliente(): Cliente {
      return Cliente.criar({
        negocioId: "neg-1",
        nome: "João",
        tipo: "PESSOA_FISICA",
        telefone: "(11) 99999-0000",
      });
    }

    it("atualizarNome atualiza e registra alteração com autor", () => {
      const cliente = criarCliente();
      cliente.atualizarNome("João Souza", "func-1");

      expect(cliente.nome).toBe("João Souza");
      expect(cliente.alteracoes[0]).toMatchObject({
        campo: "nome",
        valorAnterior: "João",
        valorNovo: "João Souza",
        alteradoPor: "func-1",
      });
    });

    it("atualizarNome lança quando nome é vazio", () => {
      const cliente = criarCliente();
      expect(() => cliente.atualizarNome("   ")).toThrow(ClienteError);
    });

    it("atualizarTelefone atualiza e aceita null para limpar", () => {
      const cliente = criarCliente();
      cliente.atualizarTelefone("(11) 98888-1111");
      expect(cliente.telefone).toBe("(11) 98888-1111");

      cliente.atualizarTelefone(null);
      expect(cliente.telefone).toBeNull();
      expect(cliente.alteracoes[1]).toMatchObject({
        campo: "telefone",
        valorNovo: null,
      });
    });

    it("atualizarEmail aceita null", () => {
      const cliente = criarCliente();
      cliente.atualizarEmail(null);
      expect(cliente.email).toBeNull();
    });

    it("atualizarDocumento atualiza e aceita null", () => {
      const cliente = criarCliente();
      cliente.atualizarDocumento("123.456.789-00");
      expect(cliente.documento).toBe("123.456.789-00");

      cliente.atualizarDocumento(null);
      expect(cliente.documento).toBeNull();
    });

    it("atualizarObservacoes aceita null", () => {
      const cliente = criarCliente();
      cliente.atualizarObservacoes(null);
      expect(cliente.observacoes).toBeNull();
    });

    it("atualizarOrigem aceita null", () => {
      const cliente = criarCliente();
      cliente.atualizarOrigem(null);
      expect(cliente.origemId).toBeNull();
    });
  });

  describe("status", () => {
    function criarCliente(): Cliente {
      return Cliente.criar({
        negocioId: "neg-1",
        nome: "João",
        tipo: "PESSOA_FISICA",
      });
    }

    it("inativar muda status para INATIVO e registra", () => {
      const cliente = criarCliente();
      cliente.inativar("func-1");

      expect(cliente.status).toBe("INATIVO");
      expect(cliente.alteracoes[0]).toMatchObject({
        campo: "status",
        valorAnterior: "ATIVO",
        valorNovo: "INATIVO",
        alteradoPor: "func-1",
      });
    });

    it("inativar duas vezes não gera nova alteração", () => {
      const cliente = criarCliente();
      cliente.inativar();
      const total = cliente.alteracoes.length;
      cliente.inativar();

      expect(cliente.status).toBe("INATIVO");
      expect(cliente.alteracoes.length).toBe(total);
    });

    it("ativar volta para ATIVO", () => {
      const cliente = criarCliente();
      cliente.inativar();
      cliente.ativar();

      expect(cliente.status).toBe("ATIVO");
    });

    it("ativar quando já ativo não gera alteração", () => {
      const cliente = criarCliente();
      cliente.ativar();

      expect(cliente.alteracoes.length).toBe(0);
    });
  });

  describe("composição de contatos", () => {
    function criarCliente(): Cliente {
      return Cliente.criar({
        negocioId: "neg-1",
        nome: "João",
        tipo: "PESSOA_FISICA",
      });
    }

    function contatoBase(clienteId: string, id = "cont-1") {
      return {
        id,
        clienteId,
        tipo: "WHATSAPP" as const,
        valor: "(11) 99999-0000",
        principal: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };
    }

    it("adiciona contato com id", () => {
      const cliente = criarCliente();
      cliente.adicionarContato(contatoBase(cliente.id));

      expect(cliente.contatos).toHaveLength(1);
      expect(cliente.contatos[0].id).toBe("cont-1");
      expect(cliente.contatos[0].tipo).toBe("WHATSAPP");
    });

    it("lança ao adicionar contato sem id", () => {
      const cliente = criarCliente();
      expect(() => cliente.adicionarContato(contatoBase(cliente.id, ""))).toThrow(
        ClienteError,
      );
    });

    it("lança ao adicionar contato duplicado", () => {
      const cliente = criarCliente();
      const contato = contatoBase(cliente.id);
      cliente.adicionarContato(contato);

      expect(() => cliente.adicionarContato(contato)).toThrow(ClienteError);
    });

    it("remove contato existente", () => {
      const cliente = criarCliente();
      cliente.adicionarContato(contatoBase(cliente.id));
      cliente.removerContato("cont-1");

      expect(cliente.contatos).toHaveLength(0);
    });

    it("lança ao remover contato inexistente", () => {
      const cliente = criarCliente();
      expect(() => cliente.removerContato("inexistente")).toThrow(ClienteError);
    });
  });
});
