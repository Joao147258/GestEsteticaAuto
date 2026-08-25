// Propriedades da entidade genérica Anexo.
// Anexo é reutilizável e não depende de nenhuma pasta específica do domínio.
export interface AnexoProps {
  id: string;
  negocioId: string;
  nome: string;
  tipo?: string | null;
  mimeType?: string | null;
  url: string;
  tamanho?: number | null;
  criadoEm: Date;
}
