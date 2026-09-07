import { OrdemServico } from '../../../../Domain';
import {
  FORMAS_PAGAMENTO_LABELS,
  CONDICOES_PAGAMENTO_LABELS,
} from '../../../../Domain/comercial';

// OrdemServicoPresenter — formata as entidades de domínio OrdemServico em respostas HTTP estáveis.
// Garante o desacoplamento entre o modelo de domínio rico e o contrato REST esperado pelo frontend.
// Converte datas para ISO 8601, normaliza nulos e omite comportamentos/métodos internos da entidade.
export class OrdemServicoPresenter {
  // Converte uma única entidade OrdemServico para o payload JSON do contrato HTTP.
  // Protege a integridade da entidade, entregando apenas propriedades serializáveis.
  static toHTTP(os: OrdemServico) {
    return {
      id: os.id,
      negocioId: os.negocioId,
      orcamentoId: os.orcamentoId ?? null,
      clienteId: os.clienteId,
      veiculoId: os.veiculoId,
      agendamentoId: os.agendamentoId ?? null,
      numero: os.numero ?? null,
      status: os.status,
      responsavelId: os.responsavelId ?? null,
      abertaEm: os.abertaEm ? os.abertaEm.toISOString() : null,
      iniciadaEm: os.iniciadaEm ? os.iniciadaEm.toISOString() : null,
      pausadaEm: os.pausadaEm ? os.pausadaEm.toISOString() : null,
      finalizadaEm: os.finalizadaEm ? os.finalizadaEm.toISOString() : null,
      entregueEm: os.entregueEm ? os.entregueEm.toISOString() : null,
      canceladaEm: os.canceladaEm ? os.canceladaEm.toISOString() : null,
      previsaoInicio: os.previsaoInicio ? os.previsaoInicio.toISOString() : null,
      previsaoConclusao: os.previsaoConclusao ? os.previsaoConclusao.toISOString() : null,
      observacoes: os.observacoes ?? null,
      pagamentoCombinado: os.pagamentoCombinado
        ? {
            formaPagamentoPrevista: os.pagamentoCombinado.formaPagamentoPrevista ?? null,
            formaPagamentoPrevistaLabel: os.pagamentoCombinado.formaPagamentoPrevista
              ? (FORMAS_PAGAMENTO_LABELS[os.pagamentoCombinado.formaPagamentoPrevista.toUpperCase()] ||
                 os.pagamentoCombinado.formaPagamentoPrevista)
              : null,
            condicaoPagamento: os.pagamentoCombinado.condicaoPagamento ?? null,
            condicaoPagamentoLabel: os.pagamentoCombinado.condicaoPagamento
              ? (CONDICOES_PAGAMENTO_LABELS[os.pagamentoCombinado.condicaoPagamento.toUpperCase()] ||
                 os.pagamentoCombinado.condicaoPagamento)
              : null,
            observacaoPagamento: os.pagamentoCombinado.observacaoPagamento ?? null,
          }
        : null,
      itens: (os.itens ?? []).map((item) => ({
        id: item.id,
        servicoId: item.servicoId ?? null,
        descricao: item.descricao,
        status: item.status,
        observacoes: item.observacoes ?? null,
        iniciadoEm: item.iniciadoEm ? (item.iniciadoEm instanceof Date ? item.iniciadoEm.toISOString() : new Date(item.iniciadoEm).toISOString()) : null,
        finalizadoEm: item.finalizadoEm ? (item.finalizadoEm instanceof Date ? item.finalizadoEm.toISOString() : new Date(item.finalizadoEm).toISOString()) : null,
      })),
      alteracoes: (os.alteracoes ?? []).map((alt) => ({
        campo: alt.campo,
        valorAnterior: alt.valorAnterior,
        valorNovo: alt.valorNovo,
        descricao: alt.descricao ?? null,
        alteradoPor: alt.alteradoPor ?? null,
        alteradoEm: alt.alteradoEm ? (alt.alteradoEm instanceof Date ? alt.alteradoEm.toISOString() : new Date(alt.alteradoEm).toISOString()) : null,
      })),
      criadoEm: os.criadoEm ? (os.criadoEm instanceof Date ? os.criadoEm.toISOString() : new Date(os.criadoEm).toISOString()) : null,
      atualizadoEm: os.atualizadoEm ? (os.atualizadoEm instanceof Date ? os.atualizadoEm.toISOString() : new Date(os.atualizadoEm).toISOString()) : null,
    };
  }

  // Converte uma lista de Ordens de Serviço em uma coleção HTTP serializada.
  // Utilizado nas respostas do endpoint GET /admin/ordens-servico.
  static manyToHTTP(ordensServico: OrdemServico[]) {
    return (ordensServico ?? []).map((os) => OrdemServicoPresenter.toHTTP(os));
  }
}
