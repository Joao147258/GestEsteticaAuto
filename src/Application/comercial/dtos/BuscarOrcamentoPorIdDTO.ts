// Entrada do BuscarOrcamentoPorIdUseCase.
// Busca sempre no escopo do negocioId: a API nunca deve acessar orçamento
// de outro negócio. orcamentoId identifica o orçamento dentro do negócio.
export type BuscarOrcamentoPorIdDTO = {
  negocioId: string;
  orcamentoId: string;
};
