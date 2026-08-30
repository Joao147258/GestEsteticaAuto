import type { MovimentacaoEstoqueInternoProps } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { ListarMovimentacoesEstoqueInternoInput } from "../dtos/listar-movimentacoes-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Lista as movimentações de um estoque interno (histórico real de saldo).
// Reutiliza o getter do domínio — não cria entidade nova apenas para consulta.
export class ListarMovimentacoesEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(
    input: ListarMovimentacoesEstoqueInternoInput,
  ): Promise<MovimentacaoEstoqueInternoProps[]> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    return estoque.movimentacoes;
  }
}
