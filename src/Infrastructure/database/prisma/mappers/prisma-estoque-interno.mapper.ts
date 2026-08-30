import { EstoqueInterno } from "../../../../Domain";
import { UnidadeMedida } from "../../../../Domain/catalogo/unidade_medida_types";
import type {
  EstoqueInterno as PrismaEstoqueInterno,
  MovimentacaoEstoqueInterno as PrismaMovimentacaoEstoqueInterno,
} from "../../../../generated/prisma/client";
import { PrismaMovimentacaoEstoqueInternoMapper } from "./prisma-movimentacao-estoque-interno.mapper";

// PrismaEstoqueInternoMapper — ponte entre a tabela EstoqueInterno (Prisma) e
// a entidade de domínio. Reconstrói o agregado com o histórico de
// movimentações (que é o que permite auditoria e idempotência de baixa).
export class PrismaEstoqueInternoMapper {
  static toDomain(
    raw: PrismaEstoqueInterno & {
      movimentacoes?: PrismaMovimentacaoEstoqueInterno[];
    },
  ): EstoqueInterno {
    return EstoqueInterno.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      produtoId: raw.produtoId,
      quantidadeAtual: Number(raw.quantidadeAtual),
      unidadeMedida: PrismaEstoqueInternoMapper.toDomainUnidadeMedida(
        raw.unidadeMedida,
      ),
      custoUnitarioAproximado:
        raw.custoUnitarioAproximado != null
          ? Number(raw.custoUnitarioAproximado)
          : null,
      estoqueMinimo: raw.estoqueMinimo != null ? Number(raw.estoqueMinimo) : null,
      observacoes: raw.observacoes ?? null,
      movimentacoes: (raw.movimentacoes ?? []).map(
        PrismaMovimentacaoEstoqueInternoMapper.toDomain,
      ),
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  static toPrisma(estoque: EstoqueInterno) {
    return {
      id: estoque.id,
      negocioId: estoque.negocioId,
      produtoId: estoque.produtoId,
      quantidadeAtual: estoque.quantidadeAtual,
      unidadeMedida: estoque.unidadeMedida,
      custoUnitarioAproximado: estoque.custoUnitarioAproximado ?? null,
      estoqueMinimo: estoque.estoqueMinimo ?? null,
      observacoes: estoque.observacoes ?? null,
      criadoEm: estoque.criadoEm,
      atualizadoEm: estoque.atualizadoEm,
    };
  }

  private static toDomainUnidadeMedida(unidadeMedida: string): UnidadeMedida {
    const valores: UnidadeMedida[] = [
      "UNIDADE",
      "ML",
      "LITRO",
      "GRAMA",
      "KG",
      "METRO",
      "PACOTE",
      "CAIXA",
    ];
    return valores.includes(unidadeMedida as UnidadeMedida)
      ? (unidadeMedida as UnidadeMedida)
      : "UNIDADE";
  }
}
