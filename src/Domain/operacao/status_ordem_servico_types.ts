// Status de ordem de serviço no domínio.
// ABERTA → AGUARDANDO_VEICULO → EM_EXECUCAO ⇄ PAUSADA → CONCLUIDA → ENTREGUE
// (ou CANCELADA, a partir de qualquer status antes de CONCLUIDA/ENTREGUE).
export type StatusOrdemServico =
  | "ABERTA"
  | "AGUARDANDO_VEICULO"
  | "EM_EXECUCAO"
  | "PAUSADA"
  | "CONCLUIDA"
  | "ENTREGUE"
  | "CANCELADA";
