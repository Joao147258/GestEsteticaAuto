import { UnidadeMedida } from "../catalogo/unidade_medida_types";
import { MovimentacaoEstoqueVendaProps } from "./MovimentacaoEstoqueVendaProps";
import { ReservaEstoqueVendaProps } from "./ReservaEstoqueVendaProps";

// Propriedades da entidade EstoqueVenda.
// Controla produtos vendidos diretamente ao cliente (separado do estoque interno).
export interface EstoqueVendaProps {
  id: string;
  negocioId: string;
  produtoId: string;
  quantidadeAtual: number;
  quantidadeReservada: number;
  unidadeMedida: UnidadeMedida;
  custoUnitario?: number | null;
  precoVenda?: number | null;
  estoqueMinimo?: number | null;
  observacoes?: string | null;
  movimentacoes: MovimentacaoEstoqueVendaProps[];
  reservas: ReservaEstoqueVendaProps[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo EstoqueVenda.
// A quantidade disponível NÃO é persistida: é calculada
// (quantidadeAtual - quantidadeReservada).
export interface CriarEstoqueVendaProps {
  negocioId: string;
  produtoId: string;
  quantidadeInicial?: number;
  unidadeMedida: UnidadeMedida;
  custoUnitario?: number | null;
  precoVenda?: number | null;
  estoqueMinimo?: number | null;
  observacoes?: string | null;
}
