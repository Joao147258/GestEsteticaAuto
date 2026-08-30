// Dados para registrar uma saída interna manual (consumo/uso interno que não
// vem de uma OS). A referência operacional é opcional — saída manual legítima
// não depende de OS e não deve ser bloqueada por duplicidade de origem.
export type RegistrarSaidaInternaEstoqueInternoInput = {
  negocioId: string;
  produtoId: string;
  quantidade: number;
  motivo?: string | null;
  referenciaTipo?: string | null;
  referenciaId?: string | null;
  referenciaItemId?: string | null;
};
