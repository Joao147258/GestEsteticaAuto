// Entrada do AprovarOrcamentoUseCase.
// Representa o aceite do cliente. Começa simples (só escopo do negócio e do
// orçamento); futuramente pode registrar quem aprovou e quando.
export type AprovarOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
};
