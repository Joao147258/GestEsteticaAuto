import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { PausarOrdemServicoInput } from "../dtos/pausar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Pausa a execução da OS. A regra de "pode pausar" (somente EM_EXECUCAO) é do
// Domain, via OrdemServico.pausar(). O campo motivo fica disponível no DTO
// para evolução futura — hoje o Domain não exige/armazena motivo na pausa.
export class PausarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: PausarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.pausar();

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
