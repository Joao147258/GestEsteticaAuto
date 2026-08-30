// Dados para registrar uma perda (avaria, vazamento, quebra, vencido).
export type RegistrarPerdaEstoqueInternoInput = {
  negocioId: string;
  produtoId: string;
  quantidade: number;
  motivo?: string | null;
};
