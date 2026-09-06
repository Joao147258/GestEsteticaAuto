import { TituloFinanceiro } from '../../../../Domain';

// TituloFinanceiroPresenter — formata as entidades TituloFinanceiro em respostas JSON estáveis para a API REST.
// Isola a camada de domínio da camada de apresentação, normalizando cálculos decimais, datas ISO e coleções aninhadas.
export class TituloFinanceiroPresenter {
  // Converte uma única entidade TituloFinanceiro para o payload HTTP esperado pelo frontend.
  static toHTTP(titulo: TituloFinanceiro) {
    const valorPagoTotal = Number(
      Math.max(0, titulo.valorTotal - titulo.saldoAberto).toFixed(2),
    );

    return {
      id: titulo.id,
      negocioId: titulo.negocioId,
      origem: titulo.origem,
      origemId: titulo.origemId ?? null,
      clienteId: titulo.clienteId ?? null,
      fornecedorId: titulo.fornecedorId ?? null,
      descricao: titulo.descricao,
      status: titulo.status,
      valorOriginal: Number(titulo.valorOriginal.toFixed(2)),
      valorDesconto: Number(titulo.valorDesconto.toFixed(2)),
      valorAcrescimo: Number(titulo.valorAcrescimo.toFixed(2)),
      valorTotal: Number(titulo.valorTotal.toFixed(2)),
      valorPago: valorPagoTotal,
      saldoDevedor: Number(titulo.saldoAberto.toFixed(2)),
      dataEmissao: titulo.dataEmissao ? (titulo.dataEmissao instanceof Date ? titulo.dataEmissao.toISOString() : new Date(titulo.dataEmissao).toISOString()) : null,
      dataVencimento: titulo.dataVencimento ? (titulo.dataVencimento instanceof Date ? titulo.dataVencimento.toISOString() : new Date(titulo.dataVencimento).toISOString()) : null,
      observacoes: titulo.observacoes ?? null,
      canceladoEm: titulo.canceladoEm ? (titulo.canceladoEm instanceof Date ? titulo.canceladoEm.toISOString() : new Date(titulo.canceladoEm).toISOString()) : null,
      motivoCancelamento: titulo.motivoCancelamento ?? null,
      parcelas: (titulo.parcelas ?? []).map((p) => {
        const valorPagoParcela = Number((p.valorPago ?? 0).toFixed(2));
        const saldoParcela = Number(Math.max(0, p.valorOriginal - valorPagoParcela).toFixed(2));
        return {
          id: p.id,
          numero: p.numero,
          tipo: p.tipo,
          status: p.status,
          descricao: p.descricao ?? null,
          valor: Number(p.valorOriginal.toFixed(2)),
          valorPago: valorPagoParcela,
          saldo: saldoParcela,
          dataVencimento: p.dataVencimento ? (p.dataVencimento instanceof Date ? p.dataVencimento.toISOString() : new Date(p.dataVencimento).toISOString()) : null,
          dataPagamento: p.dataPagamento ? (p.dataPagamento instanceof Date ? p.dataPagamento.toISOString() : new Date(p.dataPagamento).toISOString()) : null,
          pagamentos: (p.pagamentos ?? []).map((pg) => ({
            id: pg.id,
            valor: Number(pg.valor.toFixed(2)),
            status: pg.status,
            dataPagamento: pg.dataPagamento ? (pg.dataPagamento instanceof Date ? pg.dataPagamento.toISOString() : new Date(pg.dataPagamento).toISOString()) : null,
            confirmadoEm: pg.confirmadoEm ? (pg.confirmadoEm instanceof Date ? pg.confirmadoEm.toISOString() : new Date(pg.confirmadoEm).toISOString()) : null,
            formaPagamentoId: pg.formaPagamentoId ?? null,
            formaPagamentoDescricao: pg.formaPagamentoDescricao ?? null,
            observacoes: pg.observacoes ?? null,
          })),
        };
      }),
      historico: (titulo.historico ?? []).map((h) => ({
        tipo: h.tipo,
        descricao: h.descricao,
        autorId: h.autorId ?? null,
        data: h.data ? (h.data instanceof Date ? h.data.toISOString() : new Date(h.data).toISOString()) : null,
      })),
      criadoEm: titulo.criadoEm ? (titulo.criadoEm instanceof Date ? titulo.criadoEm.toISOString() : new Date(titulo.criadoEm).toISOString()) : null,
      atualizadoEm: titulo.atualizadoEm ? (titulo.atualizadoEm instanceof Date ? titulo.atualizadoEm.toISOString() : new Date(titulo.atualizadoEm).toISOString()) : null,
    };
  }

  // Converte uma lista de títulos a receber em coleções formatadas para HTTP.
  static manyToHTTP(titulos: TituloFinanceiro[]) {
    return (titulos ?? []).map((t) => TituloFinanceiroPresenter.toHTTP(t));
  }
}
