// Entrada do AtualizarOrdemServicoUseCase.
// Atualiza apenas dados operacionais simples. NÃO aceita status: troca de
// status deve passar pelos use-cases específicos (iniciar/pausar/concluir/
// cancelar), que delegam a validação ao Domain. Também não aceita dados
// financeiros nem de estoque — pertencem aos seus módulos.
export type AtualizarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
  observacoes?: string;
  previsaoInicio?: Date;
  previsaoConclusao?: Date;
};
