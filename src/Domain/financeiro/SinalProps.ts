// Status de sinal (default "PENDENTE" no schema Prisma).
export type StatusSinal = "PENDENTE" | "RECEBIDO" | "CANCELADO";

// Propriedades da entidade Sinal.
// Representa entrada/adiantamento; Cliente referenciado por id (opcional).
export interface SinalProps {
  id: string;
  negocioId: string;
  clienteId?: string | null;
  valor: number;
  status: StatusSinal;
  observacoes?: string | null;
  criadoEm: Date;
}
