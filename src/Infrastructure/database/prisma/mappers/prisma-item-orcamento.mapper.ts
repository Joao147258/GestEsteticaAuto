import { ItemOrcamentoProps, TipoItemOrcamento } from "../../../../Domain/comercial";
import type { ItemOrcamento as PrismaItemOrcamento } from "../../../../generated/prisma/client";

// PrismaItemOrcamentoMapper — converte ItemOrcamento entre o formato do banco
// (servicoId/produtoId separados) e o formato do domínio (tipo + referenciaId).
// O banco mantém os campos separados; o mapper deriva tipo/referenciaId.
export class PrismaItemOrcamentoMapper {
  // Banco → Domínio. Regra de derivação (decisão do projeto):
  // servicoId preenchido → tipo SERVICO + referenciaId = servicoId;
  // caso contrário → tipo PRODUTO + referenciaId = produtoId (pode ser null).
  static toDomain(raw: PrismaItemOrcamento): ItemOrcamentoProps {
    const tipo: TipoItemOrcamento = raw.servicoId ? "SERVICO" : "PRODUTO";

    return {
      id: raw.id,
      negocioId: raw.negocioId,
      orcamentoId: raw.orcamentoId,
      tipo,
      referenciaId: raw.servicoId ?? raw.produtoId ?? null,
      descricao: raw.descricao ?? "",
      quantidade: Number(raw.quantidade),
      valorUnitario: Number(raw.valorUnitario),
      valorDesconto: raw.desconto != null ? Number(raw.desconto) : 0,
      valorTotal: Number(raw.valorTotal),
      observacoes: raw.observacoes ?? null,
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    };
  }

  // Domínio → Banco. Nunca preenche servicoId e produtoId ao mesmo tempo
  // (proteção no mapper: só um dos dois é gravado).
  static toPrisma(item: ItemOrcamentoProps) {
    const servicoId = item.tipo === "SERVICO" ? item.referenciaId ?? null : null;
    const produtoId = item.tipo === "PRODUTO" ? item.referenciaId ?? null : null;

    return {
      id: item.id,
      negocioId: item.negocioId,
      orcamentoId: item.orcamentoId,
      servicoId,
      produtoId,
      tipo: item.tipo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      desconto: item.valorDesconto,
      observacoes: item.observacoes ?? null,
      criadoEm: item.criadoEm,
      atualizadoEm: item.atualizadoEm,
    };
  }
}
