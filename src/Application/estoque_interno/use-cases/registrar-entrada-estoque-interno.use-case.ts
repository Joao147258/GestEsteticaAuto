import type { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RegistrarEntradaEstoqueInternoInput } from "../dtos/registrar-entrada-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Registra uma entrada (reposição/compra) no estoque interno.
// A Application apenas localiza o estoque e delega a movimentação ao domínio.
export class RegistrarEntradaEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(input: RegistrarEntradaEstoqueInternoInput): Promise<EstoqueInterno> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    estoque.adicionarEntrada(input.quantidade, input.motivo);

    await this.estoquesRepository.salvar(estoque);

    return estoque;
  }
}
