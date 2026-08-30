import type { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { ConsultarEstoqueInternoInput } from "../dtos/consultar-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Consulta o saldo do estoque interno de um produto do negócio.
// Busca sempre escopada por negocioId — não permite acesso a outro negócio.
export class ConsultarSaldoEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(input: ConsultarEstoqueInternoInput): Promise<EstoqueInterno> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    return estoque;
  }
}
