import { StatusOrcamento, OrigemOrcamento } from "../../../Domain";

// Resposta padrão dos use cases comerciais (busca, listagem, criação).
// O use case monta este formato a partir da entidade Orcamento do domínio.

// Linha do orçamento na resposta: inclui o nome do serviço (projeção do
// catálogo) e o valor total da linha já calculado. servicoId vem da
// referência do item (referenciaId) e é null para itens de produto.
export type OrcamentoItemOutputDTO = {
  id: string;
  servicoId: string | null;
  nomeServico: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacao?: string;
};

// Orçamento na resposta. valorTotal vem calculado pelo domínio (nunca
// informado por fora). status é o enum do domínio. veiculoId é null quando o
// orçamento não foi vinculado a um veículo (o domínio permite).
export type OrcamentoOutputDTO = {
  id: string;
  negocioId: string;
  clienteId: string;
  veiculoId: string | null;
  origem: OrigemOrcamento;
  status: StatusOrcamento;
  itens: OrcamentoItemOutputDTO[];
  valorTotal: number;
  observacoes?: string;
  validadeEm?: Date;
  criadoEm: Date;
  atualizadoEm?: Date;
};
