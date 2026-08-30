import { ConsumoInsumoServico } from "../../../../Domain";
import { UnidadeMedida } from "../../../../Domain/catalogo/unidade_medida_types";
import type { ConsumoInsumoServico as PrismaConsumoInsumoServico } from "../../../../generated/prisma/client";

// PrismaConsumoInsumoServicoMapper — ponte entre a tabela
// ConsumoInsumoServico (Prisma) e a entidade de domínio. Traduz campos e
// Decimal ↔ number. NÃO valida tipoUso (Application decide) nem converte
// unidade (regra de conversão mora no Domain).
export class PrismaConsumoInsumoServicoMapper {
  static toDomain(raw: PrismaConsumoInsumoServico): ConsumoInsumoServico {
    return ConsumoInsumoServico.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      servicoId: raw.servicoId,
      produtoId: raw.produtoId,
      quantidade: Number(raw.quantidade),
      unidadeMedida: PrismaConsumoInsumoServicoMapper.toDomainUnidadeMedida(
        raw.unidadeMedida,
      ),
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  static toPrisma(consumo: ConsumoInsumoServico) {
    return {
      id: consumo.id,
      negocioId: consumo.negocioId,
      servicoId: consumo.servicoId,
      produtoId: consumo.produtoId,
      quantidade: consumo.quantidade,
      unidadeMedida: consumo.unidadeMedida,
      criadoEm: consumo.criadoEm,
      atualizadoEm: consumo.atualizadoEm,
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
