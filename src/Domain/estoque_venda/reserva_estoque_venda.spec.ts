import { ReservaEstoqueVenda } from "./reserva_estoque_venda";
import { EstoqueVendaError } from "./EstoqueVendaError";

describe("ReservaEstoqueVenda", () => {
  function criarReserva(
    overrides: Partial<Parameters<typeof ReservaEstoqueVenda.criar>[0]> = {},
  ) {
    return ReservaEstoqueVenda.criar({
      negocioId: "neg-1",
      estoqueVendaId: "est-1",
      produtoId: "prod-1",
      quantidade: 3,
      unidadeMedida: "UNIDADE",
      referenciaId: "orc-1",
      referenciaTipo: "ORCAMENTO",
      ...overrides,
    });
  }

  it("cria reserva com status ATIVA por padrão", () => {
    const reserva = criarReserva();

    expect(reserva.id).toBeTruthy();
    expect(reserva.negocioId).toBe("neg-1");
    expect(reserva.estoqueVendaId).toBe("est-1");
    expect(reserva.produtoId).toBe("prod-1");
    expect(reserva.quantidade).toBe(3);
    expect(reserva.unidadeMedida).toBe("UNIDADE");
    expect(reserva.status).toBe("ATIVA");
    expect(reserva.referenciaId).toBe("orc-1");
    expect(reserva.referenciaTipo).toBe("ORCAMENTO");
  });

  it("valida campos obrigatórios", () => {
    expect(() =>
      criarReserva({ negocioId: undefined as unknown as string }),
    ).toThrow(EstoqueVendaError);
    expect(() =>
      criarReserva({ estoqueVendaId: undefined as unknown as string }),
    ).toThrow(EstoqueVendaError);
    expect(() =>
      criarReserva({ produtoId: undefined as unknown as string }),
    ).toThrow(EstoqueVendaError);
    expect(() =>
      criarReserva({ unidadeMedida: undefined as unknown as "UNIDADE" }),
    ).toThrow(EstoqueVendaError);
  });

  it("lança EstoqueVendaError quando quantidade é zero ou negativa", () => {
    expect(() => criarReserva({ quantidade: 0 })).toThrow(EstoqueVendaError);
    expect(() => criarReserva({ quantidade: -1 })).toThrow(EstoqueVendaError);
  });
});
