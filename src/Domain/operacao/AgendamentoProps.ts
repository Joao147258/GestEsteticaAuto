import { StatusAgendamento } from "./status_agendamento_types";

// Propriedades da entidade Agendamento.
// Representa um horário marcado; Agenda, Cliente, Veiculo e Orcamento por id.
export interface AgendamentoProps {
  id: string;
  negocioId: string;
  agendaId?: string | null;
  clienteId: string;
  veiculoId?: string | null;
  orcamentoId?: string | null;
  ordemServicoId?: string | null;
  inicio: Date;
  fim?: Date | null;
  duracaoEstimadaMinutos?: number | null;
  status: StatusAgendamento;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Agendamento.
export interface CriarAgendamentoProps {
  negocioId: string;
  agendaId?: string | null;
  clienteId: string;
  veiculoId?: string | null;
  orcamentoId?: string | null;
  inicio: Date;
  duracaoEstimadaMinutos?: number | null;
  observacoes?: string | null;
}
