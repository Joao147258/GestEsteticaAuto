// Entrada do use-case de resumo financeiro (futuro dashboard).
// Retorna indicadores como valorPrevisto, valorRecebido, valorEmAberto,
// valorVencido e quantidades por status, dentro do período opcional.
export type ObterResumoFinanceiroInput = {
  negocioId: string;

  dataInicio?: Date;
  dataFim?: Date;
};
