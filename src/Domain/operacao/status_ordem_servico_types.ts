// Status de ordem de serviço no domínio.
// ABERTA → AGUARDANDO_VEICULO → EM_EXECUCAO ⇄ PAUSADA → CONCLUIDA (ou CANCELADA)
export type StatusOrdemServico =
  | "ABERTA"
  | "AGUARDANDO_VEICULO"
  | "EM_EXECUCAO"
  | "PAUSADA"
  | "CONCLUIDA"
  | "CANCELADA";
