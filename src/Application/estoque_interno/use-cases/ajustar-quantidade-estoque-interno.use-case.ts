import type { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { AjustarQuantidadeEstoqueInternoInput } from "../dtos/ajustar-quantidade-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Ajusta manualmente a quantidade (correção de saldo, inventário, ajuste
// administrativo). Não usar para simular entrada/saída comum. A regra de
// saldo não negativo continua no domínio.
export class AjustarQuantidadeEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(
    input: AjustarQuantidadeEstoqueInternoInput,
  ): Promise<EstoqueInterno> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    estoque.ajustarQuantidade(input.novaQuantidade, input.motivo);

    await this.estoquesRepository.salvar(estoque);

    return estoque;
  }
}
