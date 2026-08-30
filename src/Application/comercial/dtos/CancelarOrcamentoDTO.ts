// Entrada do CancelarOrcamentoUseCase.
// Representa a decisão interna da empresa de invalidar o orçamento (não é
// recusa do cliente). motivo é opcional (ex.: "orçamento criado errado",
// "cliente duplicado", "substituído por outro").
export type CancelarOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  motivo?: string;
};
