// Entrada do AtualizarObservacoesOrcamentoUseCase.
// Altera apenas as observações comerciais do orçamento — não mexe em itens,
// status ou valores. observacoes opcional: null/undefined limpa o campo.
export type AtualizarObservacoesOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  observacoes?: string;
};
