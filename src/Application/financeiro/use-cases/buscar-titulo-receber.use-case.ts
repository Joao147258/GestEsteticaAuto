import { TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { BuscarTituloReceberInput } from "../dtos/buscar-titulo-receber.input";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";

// Busca um título pelo id, sempre no escopo do negocioId — um negócio nunca
// acessa título de outro. Se não encontrar, lança NotFoundError.
export class BuscarTituloReceberUseCase {
  constructor(
    private readonly titulosReceberRepository: TitulosReceberRepository,
  ) {}

  async execute(input: BuscarTituloReceberInput): Promise<TituloFinanceiro> {
    const titulo = await this.titulosReceberRepository.buscarPorId(
      input.negocioId,
      input.tituloId,
    );

    if (!titulo) {
      throw new NotFoundError("Título financeiro não encontrado.");
    }

    return titulo;
  }
}
