import { Produto } from "../../../../Domain";
import { TipoUsoProduto } from "../../../../Domain/catalogo/tipo_uso_produto_types";
import { UnidadeMedida } from "../../../../Domain/catalogo/unidade_medida_types";
import type { Produto as PrismaProduto } from "../../../../generated/prisma/client";

// PrismaProdutoMapper — ponte entre a tabela Produto (Prisma) e a entidade
// Produto (Domain). NÃO contém regra de negócio; apenas tradução de campos,
// incluindo enums (tipoUso, unidadeMedida) e Decimal ↔ number.
export class PrismaProdutoMapper {
  // Banco → Domínio, via reconstituir. Os campos legados do schema (preco,
  // codigoBarras, estoqueMinimo) NÃO são mapeados: não pertencem ao Domain.
  static toDomain(raw: PrismaProduto): Produto {
    return Produto.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      nome: raw.nome,
      descricao: raw.descricao ?? null,
      categoriaId: raw.categoriaProdutoId ?? null,
      tipoUso: PrismaProdutoMapper.toDomainTipoUso(raw.tipoUso),
      unidadeMedida: PrismaProdutoMapper.toDomainUnidadeMedida(raw.unidadeMedida),
      custoReferencia:
        raw.custoReferencia != null ? Number(raw.custoReferencia) : null,
      precoVendaSugerido:
        raw.precoVendaSugerido != null ? Number(raw.precoVendaSugerido) : null,
      status: raw.status === "INATIVO" ? "INATIVO" : "ATIVO",
      observacoes: raw.observacoes ?? null,
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  // Domínio → Banco. categoriaId ↔ categoriaProdutoId (nome do banco mantido).
  static toPrisma(produto: Produto) {
    return {
      id: produto.id,
      negocioId: produto.negocioId,
      categoriaProdutoId: produto.categoriaId ?? null,
      nome: produto.nome,
      descricao: produto.descricao ?? null,
      tipoUso: produto.tipoUso,
      unidadeMedida: produto.unidadeMedida,
      custoReferencia: produto.custoReferencia ?? null,
      precoVendaSugerido: produto.precoVendaSugerido ?? null,
      observacoes: produto.observacoes ?? null,
      status: produto.status,
      criadoEm: produto.criadoEm,
      atualizadoEm: produto.atualizadoEm,
    };
  }

  // Enums: mapeia a string do banco para o union do domínio. Valores fora do
  // esperado caem no valor default, alinhado ao default do schema — nunca
  // quebra a reconstituição por dado legado inválido.
  private static toDomainTipoUso(tipoUso: string): TipoUsoProduto {
    const valores: TipoUsoProduto[] = ["INSUMO_INTERNO", "PRODUTO_VENDA", "AMBOS"];
    return valores.includes(tipoUso as TipoUsoProduto)
      ? (tipoUso as TipoUsoProduto)
      : "INSUMO_INTERNO";
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
