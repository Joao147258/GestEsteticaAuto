import { InspecaoEntrada } from "./inspecao_entrada";
import { OperacaoError } from "./OperacaoError";

describe("InspecaoEntrada", () => {
  function criarInspecao(
    overrides: Partial<Parameters<typeof InspecaoEntrada.criar>[0]> = {},
  ) {
    return InspecaoEntrada.criar({
      negocioId: "neg-1",
      ordemServicoId: "os-1",
      veiculoId: "vei-1",
      quilometragem: 82300,
      nivelCombustivel: "1/4",
      avarias: [" risco no para-choque ", "roda arranhada"],
      itensPessoais: ["carregador"],
      ...overrides,
    });
  }

  it("cria inspeção com dados normalizados", () => {
    const inspecao = criarInspecao();

    expect(inspecao.id).toBeTruthy();
    expect(inspecao.negocioId).toBe("neg-1");
    expect(inspecao.ordemServicoId).toBe("os-1");
    expect(inspecao.veiculoId).toBe("vei-1");
    expect(inspecao.quilometragem).toBe(82300);
    expect(inspecao.nivelCombustivel).toBe("1/4");
    expect(inspecao.avarias).toEqual(["risco no para-choque", "roda arranhada"]);
    expect(inspecao.itensPessoais).toEqual(["carregador"]);
    expect(inspecao.inspecionadoEm).toBeInstanceOf(Date);
  });

  it("valida campos obrigatórios e quilometragem negativa", () => {
    expect(() =>
      criarInspecao({ negocioId: "  " }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarInspecao({ ordemServicoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarInspecao({ veiculoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() => criarInspecao({ quilometragem: -1 })).toThrow(OperacaoError);
  });
});
