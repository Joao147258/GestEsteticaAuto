import { PagamentoProps, StatusPagamento } from "../../../../Domain/financeiro";
import type { Pagamento as PrismaPagamento } from "../../../../generated/prisma/client";

// PrismaPagamentoMapper — converte Pagamento entre Prisma e Domain.
// O pagamento é histórico da parcela: nunca apagar registros no repositório.
export class PrismaPagamentoMapper {
  static toDomain(raw: PrismaPagamento): PagamentoProps {
    return {
      id: raw.id,
      negocioId: raw.negocioId,
      tituloFinanceiroId: raw.tituloId,
      parcelaFinanceiraId: raw.parcelaId,
      valor: Number(raw.valor),
      formaPagamentoId: raw.formaPagamentoId,
      formaPagamentoDescricao: raw.formaPagamentoDescricao,
      dataPagamento: raw.dataPagamento,
      status: PrismaPagamentoMapper.toDomainStatus(raw.status),
      observacoes: raw.observacoes ?? null,
      criadoEm: raw.criadoEm,
      confirmadoEm: raw.confirmadoEm ?? null,
      canceladoEm: raw.canceladoEm ?? null,
      motivoCancelamento: raw.motivoCancelamento ?? null,
    };
  }

  static toPrisma(pagamento: PagamentoProps) {
    return {
      id: pagamento.id,
      negocioId: pagamento.negocioId,
      tituloId: pagamento.tituloFinanceiroId,
      parcelaId: pagamento.parcelaFinanceiraId,
      formaPagamentoId: pagamento.formaPagamentoId,
      formaPagamentoDescricao: pagamento.formaPagamentoDescricao,
      valor: pagamento.valor,
      status: pagamento.status,
      dataPagamento: pagamento.dataPagamento,
      observacoes: pagamento.observacoes ?? null,
      criadoEm: pagamento.criadoEm,
      confirmadoEm: pagamento.confirmadoEm ?? null,
      canceladoEm: pagamento.canceladoEm ?? null,
      motivoCancelamento: pagamento.motivoCancelamento ?? null,
    };
  }

  private static toDomainStatus(status: string): StatusPagamento {
    const valores: StatusPagamento[] = ["PENDENTE", "CONFIRMADO", "CANCELADO"];
    return valores.includes(status as StatusPagamento)
      ? (status as StatusPagamento)
      : "PENDENTE";
  }
}
