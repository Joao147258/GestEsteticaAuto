import { ConsumoInsumoServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { AdicionarConsumoInsumoServicoInput } from "../dtos/adicionar-consumo-insumo-servico.input";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";
import { ProdutosRepository } from "../repositories/produtos.repository";
import { ServicosRepository } from "../repositories/servicos.repository";

// Orquestra o vínculo entre serviço e produto como consumo operacional:
// valida existência de serviço/produto no negócio e o tipo de uso do produto
// (só INSUMO_INTERNO ou AMBOS podem virar insumo), antes de criar e salvar.
export class AdicionarConsumoInsumoServicoUseCase {
  constructor(
    private readonly consumosRepository: ConsumosInsumoServicoRepository,
    private readonly servicosRepository: ServicosRepository,
    private readonly produtosRepository: ProdutosRepository,
  ) {}

  async execute(
    input: AdicionarConsumoInsumoServicoInput,
  ): Promise<ConsumoInsumoServico> {
    const servico = await this.servicosRepository.buscarPorId(
      input.negocioId,
      input.servicoId,
    );
    if (!servico) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    const produto = await this.produtosRepository.buscarPorId(
      input.negocioId,
      input.produtoId,
    );
    if (!produto) {
      throw new NotFoundError("Produto não encontrado.");
    }

    if (produto.tipoUso === "PRODUTO_VENDA") {
      throw new ValidationError(
        "Produto exclusivo de venda não pode ser usado como insumo de serviço.",
      );
    }

    const consumo = ConsumoInsumoServico.criar({
      negocioId: input.negocioId,
      servicoId: input.servicoId,
      produtoId: input.produtoId,
      quantidade: input.quantidade,
      unidadeMedida: input.unidadeMedida,
    });

    await this.consumosRepository.salvar(consumo);

    return consumo;
  }
}
