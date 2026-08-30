import { MovimentacaoEstoqueInternoProps } from "../../../../Domain/estoque_interno/MovimentacaoEstoqueInternoProps";
import { TipoMovimentacaoEstoqueInterno } from "../../../../Domain/estoque_interno/tipo_movimentacao_estoque_interno_types";
import { UnidadeMedida } from "../../../../Domain/catalogo/unidade_medida_types";
import type { MovimentacaoEstoqueInterno as PrismaMovimentacaoEstoqueInterno } from "../../../../generated/prisma/client";

// PrismaMovimentacaoEstoqueInternoMapper — converte a movimentação de estoque
// entre Prisma e Domain. Movimentação é histórico: nada de apagar no repositório.
export class PrismaMovimentacaoEstoqueInternoMapper {
  static toDomain(raw: PrismaMovimentacaoEstoqueInterno): MovimentacaoEstoqueInternoProps {
    return {
      id: raw.id,
      negocioId: raw.negocioId,
      estoqueInternoId: raw.estoqueInternoId,
      produtoId: raw.produtoId,
      tipo: PrismaMovimentacaoEstoqueInternoMapper.toDomainTipo(raw.tipo),
      quantidade: Number(raw.quantidade),
      unidadeMedida: PrismaMovimentacaoEstoqueInternoMapper.toDomainUnidadeMedida(
        raw.unidadeMedida,
      ),
      quantidadeAnterior: Number(raw.quantidadeAnterior),
      quantidadeNova: Number(raw.quantidadeNova),
      motivo: raw.motivo ?? null,
      observacoes: raw.observacoes ?? null,
      referenciaId: raw.referenciaId ?? null,
      referenciaTipo: raw.referenciaTipo ?? null,
      referenciaItemId: raw.referenciaItemId ?? null,
      registradoEm: raw.registradoEm,
    };
  }

  static toPrisma(mov: MovimentacaoEstoqueInternoProps) {
    return {
      id: mov.id,
      negocioId: mov.negocioId,
      estoqueInternoId: mov.estoqueInternoId,
      produtoId: mov.produtoId,
      tipo: mov.tipo,
      quantidade: mov.quantidade,
      unidadeMedida: mov.unidadeMedida,
      quantidadeAnterior: mov.quantidadeAnterior,
      quantidadeNova: mov.quantidadeNova,
      motivo: mov.motivo ?? null,
      observacoes: mov.observacoes ?? null,
      referenciaId: mov.referenciaId ?? null,
      referenciaTipo: mov.referenciaTipo ?? null,
      referenciaItemId: mov.referenciaItemId ?? null,
      registradoEm: mov.registradoEm,
    };
  }

  private static toDomainTipo(tipo: string): TipoMovimentacaoEstoqueInterno {
    const valores: TipoMovimentacaoEstoqueInterno[] = [
      "ENTRADA",
      "SAIDA_INTERNA",
      "PERDA",
      "AJUSTE",
    ];
    return valores.includes(tipo as TipoMovimentacaoEstoqueInterno)
      ? (tipo as TipoMovimentacaoEstoqueInterno)
      : "AJUSTE";
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
