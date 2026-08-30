import { EstoqueInterno } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { CriarItemEstoqueInternoInput } from "../dtos/criar-item-estoque-interno.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Cria o registro de estoque interno de um produto do negócio.
// Um produto só possui um estoque interno no negócio — se já existir, rejeita.
// O saldo inicial entra como movimentação ENTRADA (regra do domínio).
export class CriarItemEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(input: CriarItemEstoqueInternoInput): Promise<EstoqueInterno> {
    const estoqueExistente = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (estoqueExistente) {
      throw new ValidationError(
        "Já existe estoque interno para este produto neste negócio.",
      );
    }

    const estoque = EstoqueInterno.criar({
      negocioId: input.negocioId,
      produtoId: input.produtoId,
      unidadeMedida: input.unidadeMedida,
      quantidadeInicial: input.quantidadeInicial ?? 0,
      custoUnitarioAproximado: input.custoUnitarioAproximado ?? null,
      estoqueMinimo: input.estoqueMinimo ?? null,
      observacoes: input.observacoes ?? null,
    });

    await this.estoquesRepository.salvar(estoque);

    return estoque;
  }
}
