import { AgendamentoProps } from "./AgendamentoProps";

// Propriedades da entidade Agenda.
// Organiza os agendamentos do negócio (composição do agregado de operação).
export interface AgendaProps {
  id: string;
  negocioId: string;
  nome: string;
  agendamentos: AgendamentoProps[];
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova Agenda.
export interface CriarAgendaProps {
  negocioId: string;
  nome: string;
}
