// Entrada do RemoverVeiculoUseCase.
// A regra sobre poder ou não remover um veículo com histórico de orçamento/OS
// fica no domínio ou é validada pela Application quando essa regra existir.
export type RemoverVeiculoInput = {
  negocioId: string;
  veiculoId: string;
};
