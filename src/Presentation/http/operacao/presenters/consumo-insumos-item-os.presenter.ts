import {
  ResultadoConfirmacaoConsumoItemOS,
  SugestaoConsumoInsumoItem,
} from '../../../../Application/operacao';

// ConsumoInsumosItemOsPresenter — formata as respostas HTTP de consumo de insumos na Operação.
// Isola os detalhes internos da Application e do Domínio, entregando JSON estrito e amigável ao frontend.
export class ConsumoInsumosItemOsPresenter {
  // Formata o resultado do cálculo de consumo previsto (apenas leitura).
  // Informa a quantidade esperada de cada insumo conforme a ficha técnica do serviço.
  static sugestaoToHTTP(
    osId: string,
    itemId: string,
    sugestoes: SugestaoConsumoInsumoItem[],
  ) {
    return {
      osId,
      itemId,
      insumosPrevistos: sugestoes.map((s) => ({
        produtoId: s.produtoId,
        quantidadePrevista: s.quantidadePrevista,
        unidadeMedida: s.unidadeMedida,
      })),
    };
  }

  // Formata o resultado da efetivação da baixa no estoque interno.
  // Discrimina baixados com sucesso, insumos já registrados (idempotência), insuficientes e alertas.
  static confirmacaoToHTTP(
    osId: string,
    itemId: string,
    resultado: ResultadoConfirmacaoConsumoItemOS,
  ) {
    return {
      osId,
      itemId,
      realizados: resultado.realizados.map((r) => ({
        produtoId: r.produtoId,
        quantidade: r.quantidade,
        unidadeMedida: r.unidadeMedida,
      })),
      jaRegistrados: resultado.jaRegistrados.map((j) => ({
        produtoId: j.produtoId,
      })),
      insuficientes: resultado.insuficientes.map((i) => ({
        produtoId: i.produtoId,
        motivo: i.motivo,
      })),
      alertasEstoqueMinimo: resultado.alertasEstoqueMinimo.map((a) => ({
        produtoId: a.produtoId,
        quantidadeAtual: a.quantidadeAtual,
        estoqueMinimo: a.estoqueMinimo,
      })),
      custoEstimado: Number(resultado.custoEstimado.toFixed(2)),
      possuiCustosDesconhecidos: resultado.possuiCustosDesconhecidos,
    };
  }
}
