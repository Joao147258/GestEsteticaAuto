// Entrada do RemoverItemOrcamentoUseCase.
// Remove um item do orçamento pelo itemId (e não por servicoId): o mesmo
// serviço pode aparecer mais de uma vez no orçamento com condições diferentes,
// e o itemId é o que identifica a linha exata a remover.
export type RemoverItemOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  itemId: string;
};
