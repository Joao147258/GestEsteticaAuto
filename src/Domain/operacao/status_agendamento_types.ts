// Status de agendamento no domínio.
// AGENDADO → CONFIRMADO → EM_ATENDIMENTO → CONCLUIDO (ou CANCELADO / NAO_COMPARECEU)
export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "NAO_COMPARECEU";
