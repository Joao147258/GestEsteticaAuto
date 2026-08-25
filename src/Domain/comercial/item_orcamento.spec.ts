import { ItemOrcamento } from "./item_orcamento";
import { ComercialError } from "./ComercialError";

describe("ItemOrcamento", () => {
  function criarItem(
    overrides: Partial<Parameters<typeof ItemOrcamento.criar>[0]> = {},
  ) {
    return ItemOrcamento.criar({
      negocioId: "neg-1",
      orcamentoId: "orc-1",
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "  Lavagem detalhada  ",
      quantidade: 2,
      valorUnitario: 120,
      ...overrides,
    });
  }

  it("cria item e calcula valorTotal", () => {
    const item = criarItem();

    expect(item.id).toBeTruthy();
    expect(item.negocioId).toBe("neg-1");
    expect(item.orcamentoId).toBe("orc-1");
    expect(item.tipo).toBe("SERVICO");
    expect(item.referenciaId).toBe("serv-1");
    expect(item.descricao).toBe("Lavagem detalhada"); // normalizada
    expect(item.quantidade).toBe(2);
    expect(item.valorUnitario).toBe(120);
    expect(item.valorTotal).toBe(240); // 2 * 120
  });

  it("desconto do item reduz o valorTotal", () => {
    const item = criarItem({ valorDesconto: 40 });
    expect(item.valorDesconto).toBe(40);
    expect(item.valorTotal).toBe(200); // 240 - 40
  });

  it("valida descrição, quantidade e valores", () => {
    expect(() => criarItem({ descricao: "  " })).toThrow(ComercialError);
    expect(() => criarItem({ quantidade: 0 })).toThrow(ComercialError);
    expect(() => criarItem({ valorUnitario: -1 })).toThrow(ComercialError);
    expect(() => criarItem({ valorDesconto: -1 })).toThrow(ComercialError);
  });

  it("lança ComercialError quando desconto supera o valor bruto", () => {
    expect(() => criarItem({ valorDesconto: 500 })).toThrow(ComercialError);
  });

  it("alterarQuantidade e alterarValorUnitario recalculam o total", () => {
    const item = criarItem();
    item.alterarQuantidade(3);
    expect(item.valorTotal).toBe(360);

    item.alterarValorUnitario(100);
    expect(item.valorTotal).toBe(300);
  });

  it("alterarDesconto recalcula e valida", () => {
    const item = criarItem();
    item.alterarDesconto(20);
    expect(item.valorTotal).toBe(220);
    expect(() => item.alterarDesconto(500)).toThrow(ComercialError);
  });
});
