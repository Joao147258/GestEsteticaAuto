// Entrada do BuscarTituloReceberUseCase.
// Busca sempre no escopo do negocioId: a API nunca deve acessar título de
// outro negócio. tituloId identifica o título dentro do negócio.
export type BuscarTituloReceberInput = {
  negocioId: string;
  tituloId: string;
};
