import { Produto } from "../../../../Domain";
import { PrismaProdutoMapper } from "./prisma-produto.mapper";

// PrismaProdutoMapper.spec — valida a conversão do Produto, incluindo enums
// (tipoUso, unidadeMedida) e Decimal ↔ number. Os campos legados do banco
// (preco, codigoBarras, estoqueMinimo) não devem aparecer no domínio.

describe("PrismaProdutoMapper", () => {
  const rawBase = {
    id: "prod-1",
    negocioId: "neg-1",
    categoriaProdutoId: "cat-1",
    nome: "Shampoo",
    descricao: "Shampoo automotivo",
    tipoUso: "INSUMO_INTERNO",
    unidadeMedida: "ML",
    custoReferencia: { toString: () => "12.5" },
    precoVendaSugerido: null,
    observacoes: "Usar diluído",
    status: "ATIVO",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte os campos do domínio e os enums", () => {
      const produto = PrismaProdutoMapper.toDomain(rawBase as any);

      expect(produto).toBeInstanceOf(Produto);
      expect(produto.id).toBe("prod-1");
      expect(produto.categoriaId).toBe("cat-1");
      expect(produto.tipoUso).toBe("INSUMO_INTERNO");
      expect(produto.unidadeMedida).toBe("ML");
      expect(produto.custoReferencia).toBe(12.5);
      expect(produto.precoVendaSugerido).toBeNull();
      expect(produto.observacoes).toBe("Usar diluído");
    });

    it("normaliza Decimal null em null no domínio", () => {
      const produto = PrismaProdutoMapper.toDomain({
        ...rawBase,
        custoReferencia: null,
      } as any);

      expect(produto.custoReferencia).toBeNull();
    });

    it("converte enums desconhecidos para o default do domínio", () => {
      const produto = PrismaProdutoMapper.toDomain({
        ...rawBase,
        tipoUso: "INVALIDO",
        unidadeMedida: "INVALIDO",
      } as any);

      expect(produto.tipoUso).toBe("INSUMO_INTERNO");
      expect(produto.unidadeMedida).toBe("UNIDADE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco (sem campos legados)", () => {
      const produto = Produto.reconstituir({
        id: "prod-1",
        negocioId: "neg-1",
        nome: "Shampoo",
        descricao: "Shampoo automotivo",
        categoriaId: "cat-1",
        tipoUso: "INSUMO_INTERNO",
        unidadeMedida: "ML",
        custoReferencia: 12.5,
        precoVendaSugerido: null,
        status: "ATIVO",
        observacoes: "Usar diluído",
        alteracoes: [],
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-02T10:00:00Z"),
      });

      const data = PrismaProdutoMapper.toPrisma(produto);

      expect(data).toEqual({
        id: "prod-1",
        negocioId: "neg-1",
        categoriaProdutoId: "cat-1",
        nome: "Shampoo",
        descricao: "Shampoo automotivo",
        tipoUso: "INSUMO_INTERNO",
        unidadeMedida: "ML",
        custoReferencia: 12.5,
        precoVendaSugerido: null,
        observacoes: "Usar diluído",
        status: "ATIVO",
        criadoEm: produto.criadoEm,
        atualizadoEm: produto.atualizadoEm,
      });
      expect(data).not.toHaveProperty("preco");
      expect(data).not.toHaveProperty("codigoBarras");
      expect(data).not.toHaveProperty("estoqueMinimo");
    });
  });
});
