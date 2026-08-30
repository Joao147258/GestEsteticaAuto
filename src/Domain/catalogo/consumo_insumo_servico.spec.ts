import { ConsumoInsumoServico } from "./consumo_insumo_servico";
import { CatalogoError } from "./CatalogoError";

describe("ConsumoInsumoServico", () => {
  it("cria consumo válido com os dados mínimos", () => {
    const consumo = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 50,
      unidadeMedida: "ML",
    });

    expect(consumo.id).toBeTruthy();
    expect(consumo.negocioId).toBe("neg-1");
    expect(consumo.servicoId).toBe("serv-1");
    expect(consumo.produtoId).toBe("prod-1");
    expect(consumo.quantidade).toBe(50);
    expect(consumo.unidadeMedida).toBe("ML");
    expect(consumo.criadoEm).toBeInstanceOf(Date);
    expect(consumo.atualizadoEm).toBeInstanceOf(Date);
  });

  it("lança CatalogoError quando negócio é vazio", () => {
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "  ",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: 2,
        unidadeMedida: "UNIDADE",
      }),
    ).toThrow(CatalogoError);
  });

  it("lança CatalogoError quando servicoId é vazio", () => {
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "neg-1",
        servicoId: "",
        produtoId: "prod-1",
        quantidade: 2,
        unidadeMedida: "UNIDADE",
      }),
    ).toThrow(CatalogoError);
  });

  it("lança CatalogoError quando produtoId é vazio", () => {
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "",
        quantidade: 2,
        unidadeMedida: "UNIDADE",
      }),
    ).toThrow(CatalogoError);
  });

  it("rejeita quantidade menor ou igual a zero", () => {
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: 0,
        unidadeMedida: "UNIDADE",
      }),
    ).toThrow(CatalogoError);
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: -1,
        unidadeMedida: "UNIDADE",
      }),
    ).toThrow(CatalogoError);
  });

  it("rejeita unidadeMedida ausente", () => {
    expect(() =>
      ConsumoInsumoServico.criar({
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: 2,
        unidadeMedida: undefined as unknown as "UNIDADE",
      }),
    ).toThrow(CatalogoError);
  });
});
