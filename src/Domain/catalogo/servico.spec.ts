import { Servico } from "./servico";
import { CatalogoError } from "./CatalogoError";

describe("Servico", () => {
  describe("criar", () => {
    it("cria serviço com precoBase obrigatório e status ATIVO", () => {
      const servico = Servico.criar({
        negocioId: "neg-1",
        nome: "  Polimento técnico  ",
        precoBase: 250,
        duracaoEstimadaMinutos: 120,
        observacoes: "Usar produto de alto rendimento",
      });

      expect(servico.id).toBeTruthy();
      expect(servico.negocioId).toBe("neg-1");
      expect(servico.nome).toBe("Polimento técnico");
      expect(servico.precoBase).toBe(250);
      expect(servico.duracaoEstimadaMinutos).toBe(120);
      expect(servico.observacoes).toBe("Usar produto de alto rendimento");
      expect(servico.status).toBe("ATIVO");
      expect(servico.alteracoes).toEqual([]);
    });

    it("lança CatalogoError quando nome é vazio", () => {
      expect(() =>
        Servico.criar({ negocioId: "neg-1", nome: "  ", precoBase: 100 }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando preço base é negativo", () => {
      expect(() =>
        Servico.criar({ negocioId: "neg-1", nome: "Polimento", precoBase: -10 }),
      ).toThrow(CatalogoError);
    });

    it("lança CatalogoError quando duração é negativa", () => {
      expect(() =>
        Servico.criar({
          negocioId: "neg-1",
          nome: "Polimento",
          precoBase: 100,
          duracaoEstimadaMinutos: -1,
        }),
      ).toThrow(CatalogoError);
    });
  });

  describe("alterações", () => {
    function criarServico(): Servico {
      return Servico.criar({
        negocioId: "neg-1",
        nome: "Polimento",
        precoBase: 250,
      });
    }

    it("atualizarNome atualiza e registra alteração com autor", () => {
      const servico = criarServico();
      servico.atualizarNome("Polimento premium", "func-1");

      expect(servico.nome).toBe("Polimento premium");
      expect(servico.alteracoes[0]).toMatchObject({
        campo: "nome",
        valorNovo: "Polimento premium",
        alteradoPor: "func-1",
      });
    });

    it("atualizarNome lança quando nome é vazio", () => {
      const servico = criarServico();
      expect(() => servico.atualizarNome("  ")).toThrow(CatalogoError);
    });

    it("alterarCategoria atualiza", () => {
      const servico = criarServico();
      servico.alterarCategoria("cat-1");
      expect(servico.categoriaId).toBe("cat-1");
    });

    it("alterarPrecoBase atualiza e valida negativo", () => {
      const servico = criarServico();
      servico.alterarPrecoBase(300);
      expect(servico.precoBase).toBe(300);
      expect(() => servico.alterarPrecoBase(-1)).toThrow(CatalogoError);
    });

    it("alterarDuracaoEstimada atualiza e valida negativo", () => {
      const servico = criarServico();
      servico.alterarDuracaoEstimada(90);
      expect(servico.duracaoEstimadaMinutos).toBe(90);
      expect(() => servico.alterarDuracaoEstimada(-5)).toThrow(CatalogoError);
    });

    it("atualizarObservacoes aceita null", () => {
      const servico = criarServico();
      servico.atualizarObservacoes(null);
      expect(servico.observacoes).toBeNull();
    });

    it("ativar e inativar registram alteração", () => {
      const servico = criarServico();
      servico.inativar();
      expect(servico.status).toBe("INATIVO");
      expect(servico.alteracoes.at(-1)?.campo).toBe("status");

      servico.ativar();
      expect(servico.status).toBe("ATIVO");
    });
  });
});
