// Entrada do CancelarOrdemServicoUseCase.
// motivo é obrigatório: cancelamento sem motivo gera histórico ruim.
export type CancelarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
  motivo: string;
};
