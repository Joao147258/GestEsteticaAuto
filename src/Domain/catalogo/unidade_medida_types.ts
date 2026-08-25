// PENDÊNCIA DE REGRA:
// Ainda precisa ser definida a lista oficial de unidades de medida.
// Implementação atual considera unidades comuns de produtos automotivos
// (líquidos: ML/LITRO; peças e descartáveis: UNIDADE/PACOTE/CAIXA).
export type UnidadeMedida =
  | "UNIDADE"
  | "ML"
  | "LITRO"
  | "GRAMA"
  | "KG"
  | "METRO"
  | "PACOTE"
  | "CAIXA";
