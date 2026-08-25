import { TipoItemOrcamento } from "./tipo_item_orcamento_types";

// Propriedades da entidade ItemOrcamento.
// Cada linha do orçamento: um serviço ou um produto vendido.
// O item guarda um snapshot da proposta (descricao/valor naquele momento)
// para não depender de mudanças futuras no catálogo.
export interface ItemOrcamentoProps {
  id: string;
  negocioId: string;
  orcamentoId: string;
  tipo: TipoItemOrcamento;
  referenciaId?: string | null; // servicoId ou produtoId de origem
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number; // quantidade * valorUnitario - valorDesconto
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo ItemOrcamento.
export interface CriarItemOrcamentoProps {
  negocioId: string;
  orcamentoId: string;
  tipo: TipoItemOrcamento;
  referenciaId?: string | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
  observacoes?: string | null;
}
