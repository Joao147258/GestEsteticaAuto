import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { BuscarOrdemServicoInput } from "../dtos/buscar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Busca uma OS pelo id, sempre no escopo do negocioId — um negócio nunca
// acessa OS de outro. Se não encontrar, lança NotFoundError (a Presentation
// transforma em HTTP 404).
export class BuscarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: BuscarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    return ordemServico;
  }
}
