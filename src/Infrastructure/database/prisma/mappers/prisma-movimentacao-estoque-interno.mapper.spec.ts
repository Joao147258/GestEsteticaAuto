import { MovimentacaoEstoqueInterno } from "../../../../Domain/estoque_interno/movimentacao_estoque_interno";
import { PrismaMovimentacaoEstoqueInternoMapper } from "./prisma-movimentacao-estoque-interno.mapper";

// PrismaMovimentacaoEstoqueInternoMapper.spec — valida a conversão da
// movimentação, incluindo tipo, referências de origem e Decimal ↔ number.

describe("PrismaMovimentacaoEstoqueInternoMapper", () => {
  const rawBase = {
    id: "mov-1",
    negocioId: "neg-1",
    estoqueInternoId: "est-1",
    produtoId: "prod-1",
    tipo: "SAIDA_INTERNA",
    quantidade: { toString: () => "0.5" },
    unidadeMedida: "LITRO",
    quantidadeAnterior: { toString: () => "2.0" },
    quantidadeNova: { toString: () => "1.5" },
    motivo: "Consumo em OS",
    observacoes: null,
    referenciaId: "os-1",
    referenciaTipo: "ORDEM_SERVICO",
    referenciaItemId: "item-os-1",
    registradoEm: new Date("2026-01-01T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte todos os campos", () => {
      const mov = PrismaMovimentacaoEstoqueInternoMapper.toDomain(rawBase as any);

      expect(mov).toEqual(
        expect.objectContaining({
          id: "mov-1",
          negocioId: "neg-1",
          estoqueInternoId: "est-1",
          produtoId: "prod-1",
          tipo: "SAIDA_INTERNA",
          quantidade: 0.5,
          unidadeMedida: "LITRO",
          quantidadeAnterior: 2.0,
          quantidadeNova: 1.5,
          motivo: "Consumo em OS",
          referenciaId: "os-1",
          referenciaTipo: "ORDEM_SERVICO",
          referenciaItemId: "item-os-1",
        }),
      );
    });

    it("mapeia tipo desconhecido para AJUSTE", () => {
      const mov = PrismaMovimentacaoEstoqueInternoMapper.toDomain({
        ...rawBase,
        tipo: "INVALIDO",
      } as any);

      expect(mov.tipo).toBe("AJUSTE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const mov = MovimentacaoEstoqueInterno.reconstituir({
        id: "mov-1",
        negocioId: "neg-1",
        estoqueInternoId: "est-1",
        produtoId: "prod-1",
        tipo: "SAIDA_INTERNA",
        quantidade: 0.5,
        unidadeMedida: "LITRO",
        quantidadeAnterior: 2.0,
        quantidadeNova: 1.5,
        motivo: "Consumo em OS",
        observacoes: null,
        referenciaId: "os-1",
        referenciaTipo: "ORDEM_SERVICO",
        referenciaItemId: "item-os-1",
        registradoEm: new Date("2026-01-01T10:00:00Z"),
      });

      const data = PrismaMovimentacaoEstoqueInternoMapper.toPrisma(mov.toProps());

      expect(data).toEqual({
        id: "mov-1",
        negocioId: "neg-1",
        estoqueInternoId: "est-1",
        produtoId: "prod-1",
        tipo: "SAIDA_INTERNA",
        quantidade: 0.5,
        unidadeMedida: "LITRO",
        quantidadeAnterior: 2.0,
        quantidadeNova: 1.5,
        motivo: "Consumo em OS",
        observacoes: null,
        referenciaId: "os-1",
        referenciaTipo: "ORDEM_SERVICO",
        referenciaItemId: "item-os-1",
        registradoEm: mov.registradoEm,
      });
    });
  });
});
