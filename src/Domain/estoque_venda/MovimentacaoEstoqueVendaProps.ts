import { TipoMovimentacaoEstoqueVenda } from "./tipo_movimentacao_estoque_venda_types";
import { UnidadeMedida } from "../catalogo/unidade_medida_types";

// Propriedades da entidade MovimentacaoEstoqueVenda.
// Histórico de tudo que altera o saldo físico (quantidadeAtual) ou a reserva.
export interface MovimentacaoEstoqueVendaProps {
  id: string;
  negocioId: string;
  estoqueVendaId: string;
  produtoId: string;
  tipo: TipoMovimentacaoEstoqueVenda;
  quantidade: number; // sempre positiva
  unidadeMedida: UnidadeMedida;
  quantidadeAnterior: number; // saldo físico antes da movimentação
  quantidadeNova: number; // saldo físico depois da movimentação (>= 0)
  quantidadeReservadaAnterior?: number | null; // reserva antes (quando aplicável)
  quantidadeReservadaNova?: number | null; // reserva depois (quando aplicável)
  motivo?: string | null;
  referenciaId?: string | null; // ex: id de orçamento, pedido ou venda
  referenciaTipo?: string | null; // ex: "ORCAMENTO", "PEDIDO", "VENDA"
  registradoEm: Date;
}
