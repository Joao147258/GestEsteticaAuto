import { Orcamento } from "../../../Domain/comercial";
import {
  OrcamentoOutputDTO,
  OrcamentoItemOutputDTO,
} from "../dtos/OrcamentoOutputDTO";

export const FORMAS_PAGAMENTO_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO_DEBITO: "Cartão de Débito",
  CARTAO_CREDITO: "Cartão de Crédito",
  TRANSFERENCIA: "Transferência",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

export const CONDICOES_PAGAMENTO_LABELS: Record<string, string> = {
  A_VISTA: "À vista",
  NA_ENTREGA: "Na entrega",
  PARCELADO: "Parcelado",
  SINAL_E_RESTANTE_NA_ENTREGA: "Sinal + restante na entrega",
  OUTRO: "Outro",
};

// OrcamentoMapper — projeção da entidade Orcamento para o formato de saída.
// Responsabilidade exclusiva: ler os dados da entidade e montar o DTO.
// Não contém regra de negócio (total, status e valores já vêm calculados
// pelo domínio) e não consulta repositórios.
export class OrcamentoMapper {
  // Projeta um Orcamento do domínio no OrcamentoOutputDTO.
  // As linhas (itens) guardam um snapshot da proposta: o nome do serviço
  // negociado fica em item.descricao e a referência do catálogo em
  // item.referenciaId (servicoId no caso de serviço).
  static paraOutput(orcamento: Orcamento): OrcamentoOutputDTO {
    const forma = orcamento.formaPagamentoPrevista ?? null;
    const condicao = orcamento.condicaoPagamento ?? null;

    return {
      id: orcamento.id,
      negocioId: orcamento.negocioId,
      clienteId: orcamento.clienteId,
      veiculoId: orcamento.veiculoId ?? null,
      ordemServicoId: orcamento.ordemServicoId ?? null,
      formaPagamentoPrevista: forma,
      formaPagamentoPrevistaLabel: forma ? (FORMAS_PAGAMENTO_LABELS[forma.toUpperCase()] || forma) : null,
      condicaoPagamento: condicao,
      condicaoPagamentoLabel: condicao ? (CONDICOES_PAGAMENTO_LABELS[condicao.toUpperCase()] || condicao) : null,
      observacaoPagamento: orcamento.observacaoPagamento ?? null,
      origem: orcamento.origem,
      status: orcamento.status,
      itens: orcamento.itens.map((item) => this.itemParaOutput(item)),
      valorTotal: orcamento.valorTotal,
      observacoes: orcamento.observacoes ?? undefined,
      validadeEm: orcamento.validoAte ?? undefined,
      criadoEm: orcamento.criadoEm,
      atualizadoEm: orcamento.atualizadoEm,
    };
  }

  private static itemParaOutput(
    item: Orcamento["itens"][number],
  ): OrcamentoItemOutputDTO {
    return {
      id: item.id,
      servicoId: item.referenciaId ?? null,
      nomeServico: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      observacao: item.observacoes ?? undefined,
    };
  }
}
