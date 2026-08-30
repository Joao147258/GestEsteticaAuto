// Entrada do use case que altera apenas dados gerais do orçamento
// (validade e observações) — não atualiza tudo de uma vez.
//
// Regra do projeto: cada ação importante tem seu próprio use case.
// Adicionar/remover item, aprovar, recusar e cancelar têm DTOs/fluxos
// próprios, então não entram aqui.
//
// valorTotal também não aparece: ele é SEMPRE calculado pelo domínio.
export type AtualizarOrcamentoDTO = {
  negocioId: string;
  orcamentoId: string;
  validadeEm?: Date;
  observacoes?: string;
};
