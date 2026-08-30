// Entrada do AdicionarItemOrcamentoUseCase.
// Adiciona um serviço do catálogo a um orçamento existente.
//
// Corresponde ao Orcamento.adicionarItem() do domínio. O orçamento injeta
// negocioId/orcamentoId internamente; aqui eles vêm explícitos no input para
// o use case buscar o orçamento no escopo certo.
//
// Nota: o domínio também exige descricao e tipo do item — esperado que a
// orquestração preencha a descricao a partir do serviço do catálogo (pendência
// para a implementação do use case).
export type AdicionarItemOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  servicoId: string;
  quantidade: number;
  valorUnitario: number;
  observacao?: string;
};
