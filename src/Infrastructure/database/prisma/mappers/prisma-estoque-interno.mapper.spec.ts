import { EstoqueInterno } from "../../../../Domain";
import { PrismaEstoqueInternoMapper } from "./prisma-estoque-interno.mapper";

// PrismaEstoqueInternoMapper.spec — valida a reconstrução do agregado
// EstoqueInterno com o histórico de movimentações.

describe("PrismaEstoqueInternoMapper", () => {
  const rawBase = {
    id: "est-1",
    negocioId: "neg-1",
    produtoId: "prod-1",
    quantidadeAtual: { toString: () => "1.5" },
    unidadeMedida: "LITRO",
    custoUnitarioAproximado: { toString: () => "20.0" },
    estoqueMinimo: { toString: () => "1.0" },
    observacoes: "Produto de limpeza",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  const movRaw = {
    id: "mov-1",
    negocioId: "neg-1",
    estoqueInternoId: "est-1",
    produtoId: "prod-1",
    tipo: "ENTRADA",
    quantidade: { toString: () => "1.5" },
    unidadeMedida: "LITRO",
    quantidadeAnterior: { toString: () => "0" },
    quantidadeNova: { toString: () => "1.5" },
    motivo: "Saldo inicial",
    observacoes: null,
    referenciaId: null,
    referenciaTipo: null,
    referenciaItemId: null,
    registradoEm: new Date("2026-01-01T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("reconstrói o agregado com histórico de movimentações", () => {
      const estoque = PrismaEstoqueInternoMapper.toDomain({
        ...rawBase,
        movimentacoes: [movRaw],
      } as any);

      expect(estoque).toBeInstanceOf(EstoqueInterno);
      expect(estoque.id).toBe("est-1");
      expect(estoque.quantidadeAtual).toBe(1.5);
      expect(estoque.unidadeMedida).toBe("LITRO");
      expect(estoque.custoUnitarioAproximado).toBe(20.0);
      expect(estoque.estoqueMinimo).toBe(1.0);
      expect(estoque.movimentacoes).toHaveLength(1);
      expect(estoque.movimentacoes[0].tipo).toBe("ENTRADA");
    });

    it("trata Decimal null como null no domínio", () => {
      const estoque = PrismaEstoqueInternoMapper.toDomain({
        ...rawBase,
        custoUnitarioAproximado: null,
        estoqueMinimo: null,
        movimentacoes: [],
      } as any);

      expect(estoque.custoUnitarioAproximado).toBeNull();
      expect(estoque.estoqueMinimo).toBeNull();
    });
  });

  describe("toPrisma", () => {
    it("converte o estoque para o formato do banco", () => {
      const estoque = PrismaEstoqueInternoMapper.toDomain({
        ...rawBase,
        movimentacoes: [movRaw],
      } as any);

      const data = PrismaEstoqueInternoMapper.toPrisma(estoque);

      expect(data).toEqual({
        id: "est-1",
        negocioId: "neg-1",
        produtoId: "prod-1",
        quantidadeAtual: 1.5,
        unidadeMedida: "LITRO",
        custoUnitarioAproximado: 20.0,
        estoqueMinimo: 1.0,
        observacoes: "Produto de limpeza",
        criadoEm: estoque.criadoEm,
        atualizadoEm: estoque.atualizadoEm,
      });
    });
  });
});
