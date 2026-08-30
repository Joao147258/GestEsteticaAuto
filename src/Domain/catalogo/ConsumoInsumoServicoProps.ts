import { UnidadeMedida } from "./unidade_medida_types";

// Propriedades da entidade ConsumoInsumoServico.
// Representa a composição operacional esperada de um serviço: quanto de um
// produto (insumo) é consumido por execução. É uma referência de operação,
// não um cálculo contábil preciso.
export interface ConsumoInsumoServicoProps {
  id: string;
  negocioId: string;
  servicoId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo ConsumoInsumoServico.
export interface CriarConsumoInsumoServicoProps {
  negocioId: string;
  servicoId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
}
