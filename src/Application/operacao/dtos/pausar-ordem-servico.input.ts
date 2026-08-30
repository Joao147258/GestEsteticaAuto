// Entrada do PausarOrdemServicoUseCase.
// motivo é opcional na primeira versão. Se o Domain exigir motivo, o
// use-case apenas repassa e o Domain valida.
export type PausarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
  motivo?: string;
};
