import { Orcamento } from "./orcamento";
import { ComercialError } from "./ComercialError";

describe("Orcamento", () => {
  function criarOrcamento(
    overrides: Partial<Parameters<typeof Orcamento.criar>[0]> = {},
  ) {
    return Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      ...overrides,
    });
  }

  function adicionarItens(orcamento: Orcamento): void {
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Lavagem detalhada",
      quantidade: 1,
      valorUnitario: 120,
    });
    orcamento.adicionarItem({
      tipo: "PRODUTO",
      referenciaId: "prod-1",
      descricao: "Aromatizante",
      quantidade: 2,
      valorUnitario: 29.9,
    });
  }

  describe("criar", () => {
    it("cria orçamento RASCUNHO com valores zerados", () => {
      const orcamento = criarOrcamento();

      expect(orcamento.id).toBeTruthy();
      expect(orcamento.negocioId).toBe("neg-1");
      expect(orcamento.clienteId).toBe("cli-1");
      expect(orcamento.veiculoId).toBe("vei-1");
      expect(orcamento.status).toBe("RASCUNHO");
      expect(orcamento.itens).toHaveLength(0);
      expect(orcamento.subtotal).toBe(0);
      expect(orcamento.valorDesconto).toBe(0);
      expect(orcamento.valorTotal).toBe(0);
      expect(orcamento.aceite).toBeNull();
    });

    it("valida negócio e cliente obrigatórios", () => {
      expect(() =>
        Orcamento.criar({ negocioId: "", clienteId: "cli-1" }),
      ).toThrow(ComercialError);
      expect(() =>
        Orcamento.criar({ negocioId: "neg-1", clienteId: "" }),
      ).toThrow(ComercialError);
    });
  });

  describe("itens e cálculo", () => {
    it("adicionarItem recalcula subtotal e total", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);

      expect(orcamento.itens).toHaveLength(2);
      expect(orcamento.subtotal).toBeCloseTo(179.8); // 120 + 2*29.9
      expect(orcamento.valorTotal).toBeCloseTo(179.8);
    });

    it("removerItem atualiza os valores", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      const itemId = orcamento.itens[0].id;

      orcamento.removerItem(itemId);

      expect(orcamento.itens).toHaveLength(1);
      expect(orcamento.subtotal).toBeCloseTo(59.8);
    });

    it("removerItem lança para item inexistente", () => {
      const orcamento = criarOrcamento();
      expect(() => orcamento.removerItem("nao-existe")).toThrow(ComercialError);
    });

    it("alterarQuantidadeItem atualiza os valores", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      const itemId = orcamento.itens[0].id;

      orcamento.alterarQuantidadeItem(itemId, 3);

      expect(orcamento.subtotal).toBeCloseTo(419.8); // 3*120 + 59.8
    });

    it("aplicarDesconto reduz o total", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);

      orcamento.aplicarDesconto(50);

      expect(orcamento.valorDesconto).toBe(50);
      expect(orcamento.valorTotal).toBeCloseTo(129.8);
    });

    it("aplicarDesconto não pode superar o subtotal", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);

      expect(() => orcamento.aplicarDesconto(500)).toThrow(ComercialError);
    });

    it("aplicarAcrescimo soma ao total", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);

      orcamento.aplicarAcrescimo(20);

      expect(orcamento.valorAcrescimo).toBe(20);
      expect(orcamento.valorTotal).toBeCloseTo(199.8);
      expect(() => orcamento.aplicarAcrescimo(-1)).toThrow(ComercialError);
    });
  });

  describe("ciclo de vida", () => {
    it("abrir passa RASCUNHO → EM_ABERTO", () => {
      const orcamento = criarOrcamento();
      orcamento.abrir();

      expect(orcamento.status).toBe("EM_ABERTO");
    });

    it("abrir lança quando já não está RASCUNHO", () => {
      const orcamento = criarOrcamento();
      orcamento.abrir();
      expect(() => orcamento.abrir()).toThrow(ComercialError);
    });

    it("aceitar exige itens e passa para ACEITO com aceite", () => {
      const orcamento = criarOrcamento();
      expect(() => orcamento.aceitar("PRESENCIAL")).toThrow(ComercialError); // sem itens

      adicionarItens(orcamento);
      orcamento.abrir();
      orcamento.aceitar("WHATSAPP", "Cliente aceitou");

      expect(orcamento.status).toBe("ACEITO");
      expect(orcamento.aceite?.status).toBe("ACEITO");
      expect(orcamento.aceite?.canal).toBe("WHATSAPP");
      expect(orcamento.aceite?.aceitoEm).toBeInstanceOf(Date);
    });

    it("aceitar só funciona em EM_ABERTO", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      expect(() => orcamento.aceitar()).toThrow(ComercialError); // RASCUNHO
    });

    it("recusar passa para RECUSADO com aceite de recusa", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      orcamento.abrir();
      orcamento.recusar("TELEFONE", "Cliente achou caro");

      expect(orcamento.status).toBe("RECUSADO");
      expect(orcamento.aceite?.status).toBe("RECUSADO");
      expect(orcamento.aceite?.recusadoEm).toBeInstanceOf(Date);
    });

    it("cancelar passa RASCUNHO → CANCELADO", () => {
      const orcamento = criarOrcamento();
      orcamento.cancelar();

      expect(orcamento.status).toBe("CANCELADO");
    });

    it("cancelar lança quando orçamento já foi aceito", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      orcamento.abrir();
      orcamento.aceitar();
      expect(() => orcamento.cancelar()).toThrow(ComercialError);
    });

    it("expirar passa EM_ABERTO → EXPIRADO", () => {
      const orcamento = criarOrcamento();
      orcamento.abrir();
      orcamento.expirar();

      expect(orcamento.status).toBe("EXPIRADO");
    });

    it("não permite alterar itens ou descontos após finalizar", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      orcamento.abrir();
      orcamento.aceitar();

      expect(() =>
        orcamento.adicionarItem({
          tipo: "PRODUTO",
          descricao: "Outro",
          quantidade: 1,
          valorUnitario: 10,
        }),
      ).toThrow(ComercialError);
      expect(() => orcamento.aplicarDesconto(10)).toThrow(ComercialError);
    });

    it("registra histórico de alterações", () => {
      const orcamento = criarOrcamento();
      adicionarItens(orcamento);
      orcamento.aplicarDesconto(10);
      orcamento.abrir();

      expect(orcamento.alteracoes.length).toBeGreaterThan(0);
      const statusAlteracao = orcamento.alteracoes.find((a) => a.campo === "status");
      expect(statusAlteracao?.valorAnterior).toBe("RASCUNHO");
      expect(statusAlteracao?.valorNovo).toBe("EM_ABERTO");
    });
  });
});
