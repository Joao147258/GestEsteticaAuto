// Entrada do BuscarVeiculoUseCase.
// Busca sempre no escopo do negocioId: a API nunca deve acessar veículo de
// outro negócio. veiculoId identifica o veículo dentro do negócio.
export type BuscarVeiculoInput = {
  negocioId: string;
  veiculoId: string;
};
