import { MovimentacaoEstoqueInterno } from "./movimentacao_estoque_interno";
import { EstoqueInternoError } from "./EstoqueInternoError";

describe("MovimentacaoEstoqueInterno", () => {
  function criarMovimentacao(
    overrides: Partial<Parameters<typeof MovimentacaoEstoqueInterno.criar>[0]> = {},
  ) {
    return MovimentacaoEstoqueInterno.criar({
      id: "mov-1",
      negocioId: "neg-1",
      estoqueInternoId: "est-1",
      produtoId: "prod-1",
      tipo: "ENTRADA",
      quantidade: 5,
      unidadeMedida: "UNIDADE",
      quantidadeAnterior: 0,
      quantidadeNova: 5,
      motivo: "Compra",
      registradoEm: new Date(),
      ...overrides,
    });
  }

  it("cria movimentação com dados válidos", () => {
    const mov = criarMovimentacao();

    expect(mov.id).toBe("mov-1");
    expect(mov.negocioId).toBe("neg-1");
    expect(mov.estoqueInternoId).toBe("est-1");
    expect(mov.produtoId).toBe("prod-1");
    expect(mov.tipo).toBe("ENTRADA");
    expect(mov.quantidade).toBe(5);
    expect(mov.unidadeMedida).toBe("UNIDADE");
    expect(mov.quantidadeAnterior).toBe(0);
    expect(mov.quantidadeNova).toBe(5);
    expect(mov.motivo).toBe("Compra");
  });

  it("lança EstoqueInternoError quando quantidade é zero ou negativa", () => {
    expect(() => criarMovimentacao({ quantidade: 0 })).toThrow(EstoqueInternoError);
    expect(() => criarMovimentacao({ quantidade: -1 })).toThrow(EstoqueInternoError);
  });

  it("lança EstoqueInternoError quando saldo anterior é negativo", () => {
    expect(() => criarMovimentacao({ quantidadeAnterior: -1 })).toThrow(
      EstoqueInternoError,
    );
  });

  it("lança EstoqueInternoError quando saldo novo é negativo", () => {
    expect(() => criarMovimentacao({ quantidadeNova: -1 })).toThrow(EstoqueInternoError);
  });

  it("mantém referência operacional completa quando informada", () => {
    const mov = criarMovimentacao({
      tipo: "SAIDA_INTERNA",
      referenciaId: "os-1",
      referenciaTipo: "ORDEM_SERVICO",
      referenciaItemId: "item-1",
    });

    expect(mov.referenciaId).toBe("os-1");
    expect(mov.referenciaTipo).toBe("ORDEM_SERVICO");
    expect(mov.referenciaItemId).toBe("item-1");
  });

  it("movimentação manual pode não ter referência de item", () => {
    const mov = criarMovimentacao({ tipo: "SAIDA_INTERNA" });

    // Campos de referência ausentes (null/undefined) são válidos em movimentação manual.
    expect(mov.referenciaId).toBeFalsy();
    expect(mov.referenciaTipo).toBeFalsy();
    expect(mov.referenciaItemId).toBeFalsy();
  });

  it("toProps devolve uma cópia dos dados", () => {
    const mov = criarMovimentacao();
    const props = mov.toProps();
    expect(props).toEqual({
      id: "mov-1",
      negocioId: "neg-1",
      estoqueInternoId: "est-1",
      produtoId: "prod-1",
      tipo: "ENTRADA",
      quantidade: 5,
      unidadeMedida: "UNIDADE",
      quantidadeAnterior: 0,
      quantidadeNova: 5,
      motivo: "Compra",
      registradoEm: mov.registradoEm,
    });
  });
});
