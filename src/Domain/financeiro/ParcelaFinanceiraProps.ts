import { PagamentoProps } from "./PagamentoProps";
import {
  StatusParcelaFinanceira,
  TipoParcelaFinanceira,
} from "./financeiro_types";

// Propriedades da entidade ParcelaFinanceira.
// Pertence a um TituloFinanceiro (referência por id).
// O saldo em aberto é derivado (valorOriginal - valorPago), mas é mantido
// na props para espelhar o que seria persistido.
export interface ParcelaFinanceiraProps {
  id: string;
  tituloFinanceiroId: string;
  numero: number;
  tipo: TipoParcelaFinanceira;
  descricao?: string | null;
  valorOriginal: number;
  valorPago: number;
  saldoAberto: number;
  dataVencimento: Date;
  dataPagamento?: Date | null;
  status: StatusParcelaFinanceira;
  pagamentos: PagamentoProps[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova ParcelaFinanceira.
// tituloFinanceiroId é injetado pelo agregado; aqui fica opcional para
// permitir criação isolada em testes.
export interface CriarParcelaFinanceiraProps {
  tituloFinanceiroId?: string | null;
  numero: number;
  tipo: TipoParcelaFinanceira;
  descricao?: string | null;
  valorOriginal: number;
  dataVencimento: Date;
}
