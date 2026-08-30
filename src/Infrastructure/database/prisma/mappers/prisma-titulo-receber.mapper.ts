import {
  OrigemTituloFinanceiro,
  StatusTituloFinanceiro,
  TituloFinanceiro,
} from "../../../../Domain/financeiro";
import type {
  Titulo as PrismaTitulo,
  Parcela as PrismaParcela,
  Pagamento as PrismaPagamento,
} from "../../../../generated/prisma/client";
import { PrismaParcelaFinanceiraMapper } from "./prisma-parcela-financeira.mapper";

// PrismaTituloReceberMapper — ponte entre o agregado TituloFinanceiro
// (Prisma) e o Domain. Reconstrói título + parcelas + pagamentos.
// valorTotal é derivado (valorOriginal - desconto + acréscimo); o histórico
// (historico) fica vazio na V1 (sem use-cases que o manipulem).
export class PrismaTituloReceberMapper {
  static toDomain(
    raw: PrismaTitulo & {
      parcelas?: Array<PrismaParcela & { pagamentos?: PrismaPagamento[] }>;
    },
  ): TituloFinanceiro {
    const valorOriginal = Number(raw.valorOriginal);

    return TituloFinanceiro.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      origem: PrismaTituloReceberMapper.toDomainOrigem(raw.origem),
      origemId: raw.origemId ?? null,
      clienteId: raw.clienteId ?? null,
      fornecedorId: raw.fornecedorId ?? null,
      descricao: raw.descricao,
      valorOriginal,
      valorDesconto: Number(raw.valorDesconto),
      valorAcrescimo: Number(raw.valorAcrescimo),
      valorTotal:
        valorOriginal - Number(raw.valorDesconto) + Number(raw.valorAcrescimo),
      status: PrismaTituloReceberMapper.toDomainStatus(raw.status),
      dataEmissao: raw.dataEmissao,
      dataVencimento: raw.dataVencimento ?? null,
      parcelas: (raw.parcelas ?? []).map(PrismaParcelaFinanceiraMapper.toDomain),
      observacoes: raw.observacoes ?? null,
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
      canceladoEm: raw.canceladoEm ?? null,
      motivoCancelamento: raw.motivoCancelamento ?? null,
      historico: [],
    });
  }

  static toPrisma(titulo: TituloFinanceiro) {
    return {
      id: titulo.id,
      negocioId: titulo.negocioId,
      origem: titulo.origem,
      origemId: titulo.origemId ?? null,
      clienteId: titulo.clienteId ?? null,
      fornecedorId: titulo.fornecedorId ?? null,
      descricao: titulo.descricao,
      valorOriginal: titulo.valorOriginal,
      valorDesconto: titulo.valorDesconto,
      valorAcrescimo: titulo.valorAcrescimo,
      status: titulo.status,
      dataEmissao: titulo.dataEmissao,
      dataVencimento: titulo.dataVencimento ?? null,
      observacoes: titulo.observacoes ?? null,
      canceladoEm: titulo.canceladoEm ?? null,
      motivoCancelamento: titulo.motivoCancelamento ?? null,
      criadoEm: titulo.criadoEm,
      atualizadoEm: titulo.atualizadoEm,
    };
  }

  private static toDomainOrigem(origem: string): OrigemTituloFinanceiro {
    const valores: OrigemTituloFinanceiro[] = [
      "ORCAMENTO",
      "ORDEM_SERVICO",
      "AVULSO",
      "AJUSTE",
    ];
    return valores.includes(origem as OrigemTituloFinanceiro)
      ? (origem as OrigemTituloFinanceiro)
      : "AVULSO";
  }

  private static toDomainStatus(status: string): StatusTituloFinanceiro {
    const valores: StatusTituloFinanceiro[] = [
      "ABERTO",
      "PARCIALMENTE_PAGO",
      "PAGO",
      "VENCIDO",
      "CANCELADO",
    ];
    return valores.includes(status as StatusTituloFinanceiro)
      ? (status as StatusTituloFinanceiro)
      : "ABERTO";
  }
}
