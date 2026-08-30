// Entrada do GerarOrdemServicoUseCase.
// A OS nasce de um orçamento aprovado: a Application busca o orçamento,
// valida se está aprovado e cria a OS a partir dele. Por isso o DTO não
// repete clienteId/veiculoId/itens — essas informações vêm do orçamento.
export type GerarOrdemServicoInput = {
  negocioId: string;
  orcamentoId: string;
};
