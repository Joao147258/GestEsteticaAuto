// Entrada do AbrirOrcamentoUseCase.
// Abre o orçamento para negociação com o cliente (RASCUNHO → EM_ABERTO).
// Passo necessário entre a montagem dos itens e a aprovação: o domínio só
// aceita orçamento EM_ABERTO (Orcamento.aceitar()), então sem este use case
// o fluxo "criar → aprovar" do painel não tem como chegar ao ACEITO.
export type AbrirOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
};
