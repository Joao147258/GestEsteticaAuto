import { ItemOrdemServico } from "./item_ordem_servico";
import { OperacaoError } from "./OperacaoError";

describe("ItemOrdemServico", () => {
  function criarItem(
    overrides: Partial<Parameters<typeof ItemOrdemServico.criar>[0]> = {},
  ) {
    return ItemOrdemServico.criar({
      negocioId: "neg-1",
      ordemServicoId: "os-1",
      servicoId: "serv-1",
      descricao: "  Lavagem detalhada  ",
      ...overrides,
    });
  }

  it("cria item PENDENTE com descrição normalizada", () => {
    const item = criarItem();

    expect(item.id).toBeTruthy();
    expect(item.negocioId).toBe("neg-1");
    expect(item.ordemServicoId).toBe("os-1");
    expect(item.servicoId).toBe("serv-1");
    expect(item.descricao).toBe("Lavagem detalhada");
    expect(item.status).toBe("PENDENTE");
    expect(item.iniciadoEm).toBeNull();
    expect(item.finalizadoEm).toBeNull();
  });

  it("valida campos obrigatórios", () => {
    expect(() =>
      criarItem({ negocioId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarItem({ ordemServicoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() => criarItem({ descricao: "  " })).toThrow(OperacaoError);
  });

  it("iniciar passa para EM_EXECUCAO e registra início", () => {
    const item = criarItem();
    item.iniciar("func-1");

    expect(item.status).toBe("EM_EXECUCAO");
    expect(item.responsavelId).toBe("func-1");
    expect(item.iniciadoEm).toBeInstanceOf(Date);
    expect(() => item.iniciar()).toThrow(OperacaoError); // já em execução
  });

  it("concluir passa para CONCLUIDO e registra finalização", () => {
    const item = criarItem();
    item.iniciar();
    item.concluir();

    expect(item.status).toBe("CONCLUIDO");
    expect(item.finalizadoEm).toBeInstanceOf(Date);
  });

  it("concluir também é permitido a partir de PENDENTE", () => {
    const item = criarItem();
    item.concluir();

    expect(item.status).toBe("CONCLUIDO");
  });

  it("cancelar passa para CANCELADO", () => {
    const item = criarItem();
    item.cancelar();

    expect(item.status).toBe("CANCELADO");
    expect(() => item.cancelar()).toThrow(OperacaoError);
  });
});
