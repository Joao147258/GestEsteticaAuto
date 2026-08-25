import { StatusAceiteOrcamento, CanalAceiteOrcamento } from "./status_aceite_orcamento_types";

// Propriedades da entidade AceiteOrcamento.
// Registra a decisão do cliente sobre a proposta (aceite, recusa ou cancelamento).
export interface AceiteOrcamentoProps {
  id: string;
  negocioId: string;
  orcamentoId: string;
  clienteId: string;
  status: StatusAceiteOrcamento;
  canal?: CanalAceiteOrcamento | null;
  aceitoEm?: Date | null;
  recusadoEm?: Date | null;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo AceiteOrcamento.
export interface CriarAceiteOrcamentoProps {
  negocioId: string;
  orcamentoId: string;
  clienteId: string;
  canal?: CanalAceiteOrcamento | null;
  observacoes?: string | null;
}
