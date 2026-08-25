import { RegistroFotografico } from "./registro_fotografico";
import { OperacaoError } from "./OperacaoError";

describe("RegistroFotografico", () => {
  function criarFoto(
    overrides: Partial<Parameters<typeof RegistroFotografico.criar>[0]> = {},
  ) {
    return RegistroFotografico.criar({
      negocioId: "neg-1",
      ordemServicoId: "os-1",
      veiculoId: "vei-1",
      tipo: "ENTRADA",
      url: "  https://storage/foto-entrada.jpg  ",
      descricao: "Foto da entrada",
      ...overrides,
    });
  }

  it("cria registro com tipo e url normalizada", () => {
    const foto = criarFoto();

    expect(foto.id).toBeTruthy();
    expect(foto.negocioId).toBe("neg-1");
    expect(foto.ordemServicoId).toBe("os-1");
    expect(foto.veiculoId).toBe("vei-1");
    expect(foto.tipo).toBe("ENTRADA");
    expect(foto.url).toBe("https://storage/foto-entrada.jpg");
    expect(foto.descricao).toBe("Foto da entrada");
    expect(foto.registradoEm).toBeInstanceOf(Date);
  });

  it("valida campos obrigatórios", () => {
    expect(() =>
      criarFoto({ ordemServicoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarFoto({ veiculoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarFoto({ tipo: undefined as unknown as "ENTRADA" }),
    ).toThrow(OperacaoError);
    expect(() => criarFoto({ url: "  " })).toThrow(OperacaoError);
  });
});
