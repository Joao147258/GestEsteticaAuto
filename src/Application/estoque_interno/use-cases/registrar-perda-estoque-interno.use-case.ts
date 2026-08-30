import type { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RegistrarPerdaEstoqueInternoInput } from "../dtos/registrar-perda-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Registra uma perda (avaria, vazamento, quebra, vencido) no estoque interno.
// A regra de saldo insuficiente continua no domínio (EstoqueInternoError).
export class RegistrarPerdaEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(input: RegistrarPerdaEstoqueInternoInput): Promise<EstoqueInterno> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    estoque.registrarPerda(input.quantidade, input.motivo);

    await this.estoquesRepository.salvar(estoque);

    return estoque;
  }
}
