// Entrada do BuscarOrdemServicoUseCase.
// Busca sempre no escopo do negocioId: a API nunca deve acessar OS de outro
// negócio. ordemServicoId identifica a OS dentro do negócio.
export type BuscarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
};
