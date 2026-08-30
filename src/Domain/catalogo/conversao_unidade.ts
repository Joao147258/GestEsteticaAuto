import { CatalogoError } from "./CatalogoError";
import { UnidadeMedida } from "./unidade_medida_types";

// Conversão de unidades de medida do catálogo.
// Categorias com unidade base própria:
//   volume  → ML como base (1 LITRO = 1000 ML)
//   massa   → GRAMA como base (1 KG = 1000 GRAMA)
//   unidade → UNIDADE é base dela mesma (sem fator)
// Unidades sem conversão (METRO, PACOTE, CAIXA) formam categoria própria:
// só convertem consigo mesmas. Conversões entre categorias diferentes são
// inválidas (ex.: ML → KG).

export type CategoriaUnidade = "VOLUME" | "MASSA" | "UNIDADE" | "OUTRA";

// Mapeia cada unidade para sua categoria e fator de conversão para a base.
const FATORES: Record<UnidadeMedida, { categoria: CategoriaUnidade; fator: number }> = {
  UNIDADE: { categoria: "UNIDADE", fator: 1 },
  ML: { categoria: "VOLUME", fator: 1 },
  LITRO: { categoria: "VOLUME", fator: 1000 },
  GRAMA: { categoria: "MASSA", fator: 1 },
  KG: { categoria: "MASSA", fator: 1000 },
  METRO: { categoria: "OUTRA", fator: 1 },
  PACOTE: { categoria: "OUTRA", fator: 1 },
  CAIXA: { categoria: "OUTRA", fator: 1 },
};

export function categoriaDaUnidade(unidade: UnidadeMedida): CategoriaUnidade {
  return FATORES[unidade].categoria;
}

// Converte uma quantidade de uma unidade para outra compatível.
// Mesma unidade retorna a própria quantidade; categorias incompatíveis
// lançam CatalogoError.
export function converterQuantidade(
  quantidade: number,
  de: UnidadeMedida,
  para: UnidadeMedida,
): number {
  if (de === para) {
    return quantidade;
  }
  const origem = FATORES[de];
  const destino = FATORES[para];
  // Unidades incompatíveis: categorias diferentes ou unidades da categoria
  // própria (OUTRA — ex.: PACOTE e CAIXA) que não são a mesma unidade.
  if (origem.categoria !== destino.categoria || origem.categoria === "OUTRA") {
    throw new CatalogoError(
      `Unidades incompatíveis para conversão: ${de} → ${para}`,
    );
  }
  // Converte para a base da categoria e depois para a unidade de destino.
  return (quantidade * origem.fator) / destino.fator;
}
