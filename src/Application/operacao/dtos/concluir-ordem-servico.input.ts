// Entrada do ConcluirOrdemServicoUseCase.
// A conclusão não recebe dados de estoque: consumo de insumos é tratado em
// fluxo próprio (ConfirmarConsumoInsumosItemOSUseCase).
export type ConcluirOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
  observacaoConclusao?: string;
};
