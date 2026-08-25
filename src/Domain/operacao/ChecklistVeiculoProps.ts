// Propriedades da entidade ChecklistVeiculo.
// Lista de conferência independente (entrada, execução ou entrega).
// SEPARADA da inspeção: aqui é a conferência, não o estado geral do veículo.
export interface ItemChecklistVeiculoProps {
  id: string;
  descricao: string;
  marcado: boolean;
  observacoes?: string | null;
}

export interface ChecklistVeiculoProps {
  id: string;
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  itens: ItemChecklistVeiculoProps[];
  responsavelId?: string | null;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo ChecklistVeiculo.
export interface CriarItemChecklistVeiculoProps {
  descricao: string;
  marcado?: boolean;
  observacoes?: string | null;
}

export interface CriarChecklistVeiculoProps {
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  itens: CriarItemChecklistVeiculoProps[];
  responsavelId?: string | null;
  observacoes?: string | null;
}
