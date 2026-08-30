// Tipos compartilhados do módulo operação.

// Registro de alteração importante na operação (histórico).
export interface RegistroAlteracaoOperacao {
  campo: string;
  valorAnterior: string | number | Date | null | undefined;
  valorNovo: string | number | Date | null | undefined;
  descricao?: string | null;
  alteradoPor?: string | null;
  alteradoEm: Date;
}

// Dados opcionais de quem/por que alterou.
export interface DadosAlteracaoOperacao {
  alteradoPor?: string | null;
  descricao?: string | null;
}

// Dados operacionais editáveis de uma OrdemServico (sem mudança de status).
// undefined preserva o valor atual; null limpa o campo (quando suportado).
export interface DadosAtualizacaoOperacionalOrdemServico {
  observacoes?: string | null;
  previsaoInicio?: Date | null;
  previsaoConclusao?: Date | null;
}
