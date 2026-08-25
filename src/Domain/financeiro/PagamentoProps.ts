import { StatusPagamento } from "./status_pagamento_types";

// Propriedades da entidade Pagamento.
// FormaPagamento referenciada por id; pode apontar para Titulo e/ou Parcela.
export interface PagamentoProps {
  id: string;
  tituloId?: string | null;
  parcelaId?: string | null;
  formaPagamentoId?: string | null;
  valor: number;
  status: StatusPagamento;
  dataPagamento: Date;
  observacoes?: string | null;
  criadoEm: Date;
}
