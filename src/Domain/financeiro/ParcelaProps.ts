// Status de parcela (default "PENDENTE" no schema Prisma).
export type StatusParcela = "PENDENTE" | "PAGA" | "VENCIDA" | "CANCELADA";

// Propriedades da entidade Parcela.
// Pertence a um Titulo (referência por id).
export interface ParcelaProps {
  id: string;
  tituloId: string;
  numero: number;
  valor: number;
  status: StatusParcela;
  dataVencimento?: Date | null;
  dataPagamento?: Date | null;
  criadoEm: Date;
}
