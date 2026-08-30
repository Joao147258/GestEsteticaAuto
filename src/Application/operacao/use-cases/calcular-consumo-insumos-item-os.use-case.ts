import type { UnidadeMedida } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { CalcularConsumoInsumosItemOSInput } from "../dtos/calcular-consumo-insumos-item-os.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";
import { ConsumosInsumoServicoRepository } from "../../catalogo/repositories/consumos-insumo-servico.repository";

// Sugestão de consumo de um item da OS: quantidade prevista por insumo,
// conforme o consumo configurado para o serviço associado ao item.
export type SugestaoConsumoInsumoItem = {
  produtoId: string;
  quantidadePrevista: number;
  unidadeMedida: UnidadeMedida;
};

// Calcula a sugestão de consumo de insumos de um item da ordem de serviço.
// Operação apenas de leitura/cálculo — não altera estoque nem nada persistido.
export class CalcularConsumoInsumosItemOSUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
    private readonly consumosRepository: ConsumosInsumoServicoRepository,
  ) {}

  async execute(
    input: CalcularConsumoInsumosItemOSInput,
  ): Promise<SugestaoConsumoInsumoItem[]> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );
    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    const item = ordemServico.itens.find(
      (atual) => atual.id === input.itemOrdemServicoId,
    );
    if (!item) {
      throw new NotFoundError("Item da ordem de serviço não encontrado.");
    }

    if (!item.servicoId) {
      return [];
    }

    const consumos = await this.consumosRepository.listarPorServico(
      input.negocioId,
      item.servicoId,
    );

    return consumos.map((consumo) => ({
      produtoId: consumo.produtoId,
      quantidadePrevista: consumo.quantidade,
      unidadeMedida: consumo.unidadeMedida,
    }));
  }
}
