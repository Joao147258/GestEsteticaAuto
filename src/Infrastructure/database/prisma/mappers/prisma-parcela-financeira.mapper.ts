import {
  ParcelaFinanceiraProps,
  StatusParcelaFinanceira,
  TipoParcelaFinanceira,
} from "../../../../Domain/financeiro";
import type {
  Parcela as PrismaParcela,
  Pagamento as PrismaPagamento,
} from "../../../../generated/prisma/client";
import { PrismaPagamentoMapper } from "./prisma-pagamento.mapper";

// PrismaParcelaFinanceiraMapper — converte ParcelaFinanceira entre Prisma e
// Domain. valorPago/saldoAberto/dataPagamento são DERIVADOS no domínio a
// partir dos pagamentos CONFIRMADOS; o mapper os recalcula ao reconstruir.
export class PrismaParcelaFinanceiraMapper {
  static toDomain(
    raw: PrismaParcela & { pagamentos?: PrismaPagamento[] },
  ): ParcelaFinanceiraProps {
    const pagamentos = (raw.pagamentos ?? []).map(PrismaPagamentoMapper.toDomain);
    const valorPago = pagamentos
      .filter((p) => p.status === "CONFIRMADO")
      .reduce((soma, p) => soma + p.valor, 0);
    const valorOriginal = Number(raw.valorOriginal);
    const saldoAberto = valorOriginal - valorPago;

    // Parcela é considerada paga quando o saldo zerou; o dataPagamento é
    // derivado do último pagamento confirmado.
    const confirmadosOrdenados = pagamentos
      .filter((p) => p.status === "CONFIRMADO")
      .sort((a, b) => b.dataPagamento.getTime() - a.dataPagamento.getTime());

    return {
      id: raw.id,
      tituloFinanceiroId: raw.tituloId,
      numero: raw.numero,
      tipo: PrismaParcelaFinanceiraMapper.toDomainTipo(raw.tipo),
      descricao: raw.descricao ?? null,
      valorOriginal,
      valorPago,
      saldoAberto,
      // dataVencimento é obrigatório no domínio; se o banco guardar null
      // (legado), usa a data de criação como fallback defensivo.
      dataVencimento: raw.dataVencimento ?? raw.criadoEm,
      dataPagamento:
        saldoAberto <= 0 && confirmadosOrdenados.length > 0
          ? confirmadosOrdenados[0].dataPagamento
          : null,
      status: PrismaParcelaFinanceiraMapper.toDomainStatus(raw.status),
      pagamentos,
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    };
  }

  static toPrisma(parcela: ParcelaFinanceiraProps) {
    return {
      id: parcela.id,
      tituloId: parcela.tituloFinanceiroId,
      numero: parcela.numero,
      tipo: parcela.tipo,
      descricao: parcela.descricao ?? null,
      valorOriginal: parcela.valorOriginal,
      status: parcela.status,
      dataVencimento: parcela.dataVencimento,
      criadoEm: parcela.criadoEm,
      atualizadoEm: parcela.atualizadoEm,
    };
  }

  private static toDomainTipo(tipo: string): TipoParcelaFinanceira {
    return tipo === "SINAL" ? "SINAL" : "PARCELA";
  }

  private static toDomainStatus(status: string): StatusParcelaFinanceira {
    const valores: StatusParcelaFinanceira[] = [
      "PENDENTE",
      "PARCIALMENTE_PAGA",
      "PAGA",
      "VENCIDA",
      "CANCELADA",
    ];
    return valores.includes(status as StatusParcelaFinanceira)
      ? (status as StatusParcelaFinanceira)
      : "PENDENTE";
  }
}
