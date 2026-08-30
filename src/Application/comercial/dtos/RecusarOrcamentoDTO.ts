// Entrada do RecusarOrcamentoUseCase.
// Representa a recusa do cliente. motivo é opcional e registra o porquê
// (ex.: "preço alto", "fechou com concorrente") — útil para análise comercial.
export type RecusarOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  motivo?: string;
};
