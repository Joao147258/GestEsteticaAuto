import { AnexoCliente } from "./anexo_cliente";
import { ClienteError } from "./ClienteError";

describe("AnexoCliente", () => {
  describe("criar", () => {
    it("cria anexo com nome obrigatório e url opcional", () => {
      const anexo = AnexoCliente.criar({
        clienteId: "cli-1",
        nome: "  doc.pdf  ",
        url: " https://storage.example.com/doc.pdf ",
      });

      expect(anexo.id).toBeTruthy();
      expect(anexo.clienteId).toBe("cli-1");
      expect(anexo.nome).toBe("doc.pdf");
      expect(anexo.url).toBe("https://storage.example.com/doc.pdf");
      expect(anexo.anexoId).toBeNull();
      expect(anexo.atualizadoEm).toBeInstanceOf(Date);
    });

    it("cria anexo sem url, referenciando apenas anexoId", () => {
      const anexo = AnexoCliente.criar({
        clienteId: "cli-1",
        nome: "autorizacao.pdf",
        anexoId: "anexo-9",
      });

      expect(anexo.url).toBeNull();
      expect(anexo.anexoId).toBe("anexo-9");
    });

    it("lança ClienteError quando nome é vazio ou clienteId inválido", () => {
      expect(() =>
        AnexoCliente.criar({ clienteId: "cli-1", nome: "  " }),
      ).toThrow(ClienteError);
      expect(() =>
        AnexoCliente.criar({ clienteId: "  ", nome: "doc.pdf" }),
      ).toThrow(ClienteError);
    });
  });

  describe("alterações", () => {
    function criarAnexo(): AnexoCliente {
      return AnexoCliente.criar({
        clienteId: "cli-1",
        nome: "doc.pdf",
        url: "https://x",
      });
    }

    it("alterarNome atualiza e valida vazio", () => {
      const anexo = criarAnexo();
      anexo.alterarNome("doc_v2.pdf");
      expect(anexo.nome).toBe("doc_v2.pdf");
      expect(() => anexo.alterarNome("  ")).toThrow(ClienteError);
    });

    it("alterarUrl aceita null", () => {
      const anexo = criarAnexo();
      anexo.alterarUrl(null);
      expect(anexo.url).toBeNull();
    });

    it("alterarAnexoId e alterarDescricao aceitam null", () => {
      const anexo = criarAnexo();
      anexo.alterarAnexoId("anexo-1");
      expect(anexo.anexoId).toBe("anexo-1");
      anexo.alterarDescricao(null);
      expect(anexo.descricao).toBeNull();
    });
  });
});
