import { StatusReservaEstoqueVenda } from "./status_reserva_estoque_venda_types";
import { UnidadeMedida } from "../catalogo/unidade_medida_types";

// Propriedades da entidade ReservaEstoqueVenda.
// Produto separado para uma possível venda futura (ex.: orçamento, pedido).
export interface ReservaEstoqueVendaProps {
  id: string;
  negocioId: string;
  estoqueVendaId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  status: StatusReservaEstoqueVenda;
  referenciaId?: string | null;
  referenciaTipo?: string | null; // ex: "ORCAMENTO", "PEDIDO", "VENDA"
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova ReservaEstoqueVenda.
export interface CriarReservaEstoqueVendaProps {
  negocioId: string;
  estoqueVendaId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  referenciaId?: string | null;
  referenciaTipo?: string | null;
  observacoes?: string | null;
}
