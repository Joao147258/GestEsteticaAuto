import { Orcamento, StatusOrcamento, OrigemOrcamento } from "../../../../Domain/comercial";
import { AceiteOrcamentoProps } from "../../../../Domain/comercial/AceiteOrcamentoProps";
import type {
  Orcamento as PrismaOrcamento,
  ItemOrcamento as PrismaItemOrcamento,
  AceiteOrcamento as PrismaAceiteOrcamento,
} from "../../../../generated/prisma/client";
import { PrismaItemOrcamentoMapper } from "./prisma-item-orcamento.mapper";
import { PrismaAceiteOrcamentoMapper } from "./prisma-aceite-orcamento.mapper";

// PrismaOrcamentoMapper — ponte entre o agregado Orcamento (Prisma) e o
// Domain. Reconstrói o agregado completo: itens + aceite mais recente.
// Não contém regra de negócio; os totais vêm do banco (o domínio os
// recalcula quando o orçamento é editado).
export class PrismaOrcamentoMapper {
  static toDomain(
    raw: PrismaOrcamento & {
      itens?: PrismaItemOrcamento[];
      aceites?: PrismaAceiteOrcamento[];
    },
  ): Orcamento {
    return Orcamento.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      clienteId: raw.clienteId,
      veiculoId: raw.veiculoId ?? null,
      origem: PrismaOrcamentoMapper.toDomainOrigem(raw.origem),
      itens: (raw.itens ?? []).map(PrismaItemOrcamentoMapper.toDomain),
      politicaComercialId: raw.politicaComercialId ?? null,
      condicaoComercialId: raw.condicaoComercialId ?? null,
      subtotal: Number(raw.subtotal),
      valorDesconto: Number(raw.valorDesconto),
      valorAcrescimo: Number(raw.valorAcrescimo),
      valorTotal: Number(raw.valorTotal),
      status: PrismaOrcamentoMapper.toDomainStatus(raw.status),
      observacoes: raw.observacoes ?? null,
      validoAte: raw.validoAte ?? null,
      aceite: PrismaOrcamentoMapper.aceiteMaisRecente(raw.aceites ?? []),
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  // Domínio → Banco. Campos legados (numero, validadeDias) NÃO entram aqui:
  // no upsert, campos ausentes no update preservam o valor existente.
  static toPrisma(orcamento: Orcamento) {
    return {
      id: orcamento.id,
      negocioId: orcamento.negocioId,
      clienteId: orcamento.clienteId,
      veiculoId: orcamento.veiculoId ?? null,
      origem: orcamento.origem,
      politicaComercialId: orcamento.politicaComercialId ?? null,
      condicaoComercialId: orcamento.condicaoComercialId ?? null,
      status: orcamento.status,
      observacoes: orcamento.observacoes ?? null,
      subtotal: orcamento.subtotal,
      valorDesconto: orcamento.valorDesconto,
      valorAcrescimo: orcamento.valorAcrescimo,
      valorTotal: orcamento.valorTotal,
      validoAte: orcamento.validoAte ?? null,
      criadoEm: orcamento.criadoEm,
      atualizadoEm: orcamento.atualizadoEm,
    };
  }

  // Aceite é 1-N no banco e único no domínio: usa o registro mais recente
  // (maior criadoEm). O histórico antigo permanece preservado no banco.
  private static aceiteMaisRecente(
    aceites: PrismaAceiteOrcamento[],
  ): AceiteOrcamentoProps | null {
    if (aceites.length === 0) {
      return null;
    }
    const maisRecente = aceites.reduce((a, b) =>
      b.criadoEm > a.criadoEm ? b : a,
    );
    return PrismaAceiteOrcamentoMapper.toDomain(maisRecente);
  }

  private static toDomainStatus(status: string): StatusOrcamento {
    const valores: StatusOrcamento[] = [
      "RASCUNHO",
      "EM_ABERTO",
      "ACEITO",
      "RECUSADO",
      "CANCELADO",
      "EXPIRADO",
    ];
    return valores.includes(status as StatusOrcamento)
      ? (status as StatusOrcamento)
      : "RASCUNHO";
  }

  // Origem é String no banco e union no domínio. Valor desconhecido vira
  // PAINEL (canal padrão da V1) — mesma estratégia do toDomainStatus.
  private static toDomainOrigem(origem: string | null | undefined): OrigemOrcamento {
    return origem === "SITE" || origem === "PAINEL" ? origem : "PAINEL";
  }
}
