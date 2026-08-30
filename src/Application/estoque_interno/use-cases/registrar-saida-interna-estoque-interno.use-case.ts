import type { EstoqueInterno } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RegistrarSaidaInternaEstoqueInternoInput } from "../dtos/registrar-saida-interna.input";
import { EstoqueInternoRepository } from "../repositories/estoque-interno.repository";

// Registra uma saída interna manual (consumo/uso interno que não vem de OS).
// A referência operacional é opcional: saída manual legítima não depende de OS
// e não passa pela proteção de duplicidade (que vale para baixas operacionais
// estruturadas). A regra de saldo continua sendo do domínio.
export class RegistrarSaidaInternaEstoqueInternoUseCase {
  constructor(
    private readonly estoquesRepository: EstoqueInternoRepository,
  ) {}

  async execute(
    input: RegistrarSaidaInternaEstoqueInternoInput,
  ): Promise<EstoqueInterno> {
    const estoque = await this.estoquesRepository.buscarPorProduto(
      input.negocioId,
      input.produtoId,
    );

    if (!estoque) {
      throw new NotFoundError("Estoque interno não encontrado.");
    }

    estoque.registrarSaidaInterna(
      input.quantidade,
      input.motivo,
      input.referenciaId ?? null,
      input.referenciaTipo ?? null,
      input.referenciaItemId ?? null,
    );

    await this.estoquesRepository.salvar(estoque);

    return estoque;
  }
}
