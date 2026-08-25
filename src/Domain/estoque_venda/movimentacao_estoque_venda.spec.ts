import { MovimentacaoEstoqueVenda } from "./movimentacao_estoque_venda";
import { EstoqueVendaError } from "./EstoqueVendaError";

describe("MovimentacaoEstoqueVenda", () => {
  function criarMovimentacao(
    overrides: Partial<Parameters<typeof MovimentacaoEstoqueVenda.criar>[0]> = {},
  ) {
    return MovimentacaoEstoqueVenda.criar({
      id: "mov-1",
      negocioId: "neg-1",
      estoqueVendaId: "est-1",
      produtoId: "prod-1",
      tipo: "BAIXA_VENDA",
      quantidade: 5,
      unidadeMedida: "UNIDADE",
      quantidadeAnterior: 10,
      quantidadeNova: 5,
      motivo: "Venda balcão",
      registradoEm: new Date(),
      ...overrides,
    });
  }

  it("cria movimentação com dados válidos", () => {
    const mov = criarMovimentacao();

    expect(mov.id).toBe("mov-1");
    expect(mov.negocioId).toBe("neg-1");
    expect(mov.estoqueVendaId).toBe("est-1");
    expect(mov.produtoId).toBe("prod-1");
    expect(mov.tipo).toBe("BAIXA_VENDA");
    expect(mov.quantidade).toBe(5);
    expect(mov.quantidadeAnterior).toBe(10);
    expect(mov.quantidadeNova).toBe(5);
    expect(mov.motivo).toBe("Venda balcão");
  });

  it("registra campos de reserva quando informados", () => {
    const mov = criarMovimentacao({
      tipo: "RESERVA",
      quantidadeReservadaAnterior: 0,
      quantidadeReservadaNova: 5,
    });

    expect(mov.quantidadeReservadaAnterior).toBe(0);
    expect(mov.quantidadeReservadaNova).toBe(5);
  });

  it("lança EstoqueVendaError quando quantidade é zero ou negativa", () => {
    expect(() => criarMovimentacao({ quantidade: 0 })).toThrow(EstoqueVendaError);
    expect(() => criarMovimentacao({ quantidade: -1 })).toThrow(EstoqueVendaError);
  });

  it("lança EstoqueVendaError quando saldo anterior ou novo é negativo", () => {
    expect(() => criarMovimentacao({ quantidadeAnterior: -1 })).toThrow(
      EstoqueVendaError,
    );
    expect(() => criarMovimentacao({ quantidadeNova: -1 })).toThrow(
      EstoqueVendaError,
    );
  });

  it("toProps devolve uma cópia dos dados", () => {
    const mov = criarMovimentacao();
    const props = mov.toProps();
    expect(props).toEqual({
      id: "mov-1",
      negocioId: "neg-1",
      estoqueVendaId: "est-1",
      produtoId: "prod-1",
      tipo: "BAIXA_VENDA",
      quantidade: 5,
      unidadeMedida: "UNIDADE",
      quantidadeAnterior: 10,
      quantidadeNova: 5,
      motivo: "Venda balcão",
      registradoEm: mov.registradoEm,
    });
  });
});
