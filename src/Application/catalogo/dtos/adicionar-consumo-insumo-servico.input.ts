import { UnidadeMedida } from "../../../Domain";

// Dados que o AdicionarConsumoInsumoServicoUseCase precisa para vincular um
// produto a um serviço como consumo operacional esperado.
export type AdicionarConsumoInsumoServicoInput = {
  negocioId: string;
  servicoId: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: UnidadeMedida;
};
