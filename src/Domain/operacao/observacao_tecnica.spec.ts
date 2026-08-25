import { ObservacaoTecnica } from "./observacao_tecnica";
import { OperacaoError } from "./OperacaoError";

describe("ObservacaoTecnica", () => {
  function criarObservacao(
    overrides: Partial<Parameters<typeof ObservacaoTecnica.criar>[0]> = {},
  ) {
    return ObservacaoTecnica.criar({
      negocioId: "neg-1",
      ordemServicoId: "os-1",
      tipo: "ALERTA",
      descricao: "  Pintura muito contaminada  ",
      ...overrides,
    });
  }

  it("cria observação com tipo e descrição normalizada", () => {
    const obs = criarObservacao();

    expect(obs.id).toBeTruthy();
    expect(obs.negocioId).toBe("neg-1");
    expect(obs.ordemServicoId).toBe("os-1");
    expect(obs.tipo).toBe("ALERTA");
    expect(obs.descricao).toBe("Pintura muito contaminada");
    expect(obs.registradaEm).toBeInstanceOf(Date);
  });

  it("valida campos obrigatórios", () => {
    expect(() =>
      criarObservacao({ ordemServicoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarObservacao({ tipo: undefined as unknown as "ALERTA" }),
    ).toThrow(OperacaoError);
    expect(() => criarObservacao({ descricao: "  " })).toThrow(OperacaoError);
  });
});
