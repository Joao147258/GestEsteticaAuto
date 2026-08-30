import { converterQuantidade, categoriaDaUnidade } from "./conversao_unidade";
import { CatalogoError } from "./CatalogoError";

describe("converterQuantidade", () => {
  it("converte LITRO para ML", () => {
    expect(converterQuantidade(1, "LITRO", "ML")).toBe(1000);
    expect(converterQuantidade(2, "LITRO", "ML")).toBe(2000);
  });

  it("converte ML para LITRO", () => {
    expect(converterQuantidade(50, "ML", "LITRO")).toBeCloseTo(0.05, 10);
    expect(converterQuantidade(1000, "ML", "LITRO")).toBeCloseTo(1, 10);
  });

  it("converte KG para GRAMA", () => {
    expect(converterQuantidade(1, "KG", "GRAMA")).toBe(1000);
  });

  it("converte GRAMA para KG", () => {
    expect(converterQuantidade(500, "GRAMA", "KG")).toBeCloseTo(0.5, 10);
  });

  it("retorna a própria quantidade para a mesma unidade", () => {
    expect(converterQuantidade(3, "ML", "ML")).toBe(3);
    expect(converterQuantidade(2, "UNIDADE", "UNIDADE")).toBe(2);
    expect(converterQuantidade(1, "LITRO", "LITRO")).toBe(1);
  });

  it("rejeita conversão entre categorias incompatíveis", () => {
    expect(() => converterQuantidade(1, "ML", "KG")).toThrow(CatalogoError);
    expect(() => converterQuantidade(1, "LITRO", "GRAMA")).toThrow(CatalogoError);
    expect(() => converterQuantidade(1, "UNIDADE", "ML")).toThrow(CatalogoError);
  });

  it("unidades sem conversão (OUTRA) só convertem consigo mesmas", () => {
    expect(converterQuantidade(2, "CAIXA", "CAIXA")).toBe(2);
    expect(() => converterQuantidade(1, "PACOTE", "CAIXA")).toThrow(CatalogoError);
    expect(() => converterQuantidade(1, "METRO", "UNIDADE")).toThrow(CatalogoError);
  });

  it("categoriaDaUnidade classifica corretamente", () => {
    expect(categoriaDaUnidade("ML")).toBe("VOLUME");
    expect(categoriaDaUnidade("LITRO")).toBe("VOLUME");
    expect(categoriaDaUnidade("GRAMA")).toBe("MASSA");
    expect(categoriaDaUnidade("KG")).toBe("MASSA");
    expect(categoriaDaUnidade("UNIDADE")).toBe("UNIDADE");
    expect(categoriaDaUnidade("METRO")).toBe("OUTRA");
    expect(categoriaDaUnidade("PACOTE")).toBe("OUTRA");
    expect(categoriaDaUnidade("CAIXA")).toBe("OUTRA");
  });
});
