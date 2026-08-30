// Dados para calcular a sugestão de consumo de insumos de um item da OS.
// Operação apenas de leitura/cálculo — não altera estoque.
export type CalcularConsumoInsumosItemOSInput = {
  negocioId: string;
  ordemServicoId: string;
  itemOrdemServicoId: string;
};
