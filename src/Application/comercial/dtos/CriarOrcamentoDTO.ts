// Entrada do CriarOrcamentoUseCase.
// O orçamento nasce como RASCUNHO: os itens informados aqui são adicionados
// na criação pela orquestração do use case (o domínio cria o agregado e depois
// adiciona cada item via Orcamento.adicionarItem()).
//
// Observação: valorTotal NÃO entra por aqui — o domínio calcula subtotal e
// total a partir dos itens (nada de valor derivado vindo de fora).

// Um item da criação: um serviço do catálogo com a quantidade e o valor
// negociado. observacao é opcional (detalhe daquele item).
export type CriarOrcamentoItemDTO = {
  servicoId: string;
  quantidade: number;
  valorUnitario: number;
  observacao?: string;
};

// Dados principais para abrir um orçamento para um cliente.
// negocioId e clienteId são obrigatórios (todo orçamento pertence a um
// negócio e é feito para um cliente); veiculoId vincula o veículo do cliente.
export type CriarOrcamentoDTO = {
  negocioId: string;
  clienteId: string;
  veiculoId: string;
  itens: CriarOrcamentoItemDTO[];
  validadeEm?: Date;
  observacoes?: string;
};
