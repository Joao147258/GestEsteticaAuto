// Registro simples para histórico/auditoria básica.
// Não adiciona tipo de alteração específico aqui — tipos específicos
// (ex.: RegistroAlteracaoFinanceiro) ficam nos módulos correspondentes.
export type RegistroAlteracao = {
  data: Date;
  autorId?: string | null;
  descricao: string;
};
