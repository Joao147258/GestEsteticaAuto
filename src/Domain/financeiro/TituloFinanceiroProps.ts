import { ParcelaFinanceiraProps } from "./ParcelaFinanceiraProps";
import {
  OrigemTituloFinanceiro,
  RegistroAlteracaoFinanceiro,
  StatusTituloFinanceiro,
} from "./financeiro_types";

// Propriedades do agregado TituloFinanceiro.
// Representa uma obrigação financeira (a receber ou a pagar).
// Valores (valorTotal, saldo em aberto) são derivados e calculados pelo domínio.
export interface TituloFinanceiroProps {
  id: string;
  negocioId: string;
  origem: OrigemTituloFinanceiro;
  origemId?: string | null;
  clienteId?: string | null;
  fornecedorId?: string | null;
  descricao: string;
  valorOriginal: number;
  valorDesconto: number;
  valorAcrescimo: number;
  valorTotal: number;
  status: StatusTituloFinanceiro;
  dataEmissao: Date;
  dataVencimento?: Date | null;
  parcelas: ParcelaFinanceiraProps[];
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
  canceladoEm?: Date | null;
  motivoCancelamento?: string | null;
  historico: RegistroAlteracaoFinanceiro[];
}

// Dados necessários para criar um novo TituloFinanceiro.
// As parcelas são obrigatórias e a soma delas deve bater com o valor total.
export interface CriarTituloFinanceiroProps {
  negocioId: string;
  origem: OrigemTituloFinanceiro;
  origemId?: string | null;
  clienteId?: string | null;
  fornecedorId?: string | null;
  descricao: string;
  valorOriginal: number;
  valorDesconto?: number;
  valorAcrescimo?: number;
  dataEmissao?: Date;
  dataVencimento?: Date | null;
  parcelas: Array<
    Omit<ParcelaFinanceiraProps, "id" | "status" | "valorPago" | "saldoAberto" | "pagamentos" | "criadoEm" | "atualizadoEm" | "tituloFinanceiroId" | "dataPagamento">
  >;
  observacoes?: string | null;
}

// Dados para registrar um pagamento em uma parcela do título.
export interface RegistrarPagamentoProps {
  parcelaFinanceiraId: string;
  valor: number;
  formaPagamentoId: string;
  formaPagamentoDescricao: string;
  dataPagamento?: Date;
  observacoes?: string | null;
  autorId?: string | null;
}
