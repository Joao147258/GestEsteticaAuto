import { ConsumoInsumoServico } from "../../../Domain";

// Contrato de persistência de consumos de insumo por serviço.
// Todos os métodos são escopados por negocioId (multi-tenant).
export abstract class ConsumosInsumoServicoRepository {
  abstract salvar(consumo: ConsumoInsumoServico): Promise<void>;

  abstract listarPorServico(
    negocioId: string,
    servicoId: string,
  ): Promise<ConsumoInsumoServico[]>;

  abstract buscarPorId(
    negocioId: string,
    consumoId: string,
  ): Promise<ConsumoInsumoServico | null>;

  abstract remover(negocioId: string, consumoId: string): Promise<void>;
}
