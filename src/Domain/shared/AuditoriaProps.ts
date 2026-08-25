// Propriedades da entidade genérica Auditoria.
// Registra criação/alteração de qualquer entidade. Usuario referenciado por id.
export interface AuditoriaProps {
  id: string;
  negocioId: string;
  entidade: string;
  entidadeId?: string | null;
  acao: string;
  usuarioId?: string | null;
  dados?: Record<string, unknown> | null;
  criadoEm: Date;
}
