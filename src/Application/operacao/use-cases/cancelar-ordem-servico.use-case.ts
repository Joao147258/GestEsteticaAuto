import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { CancelarOrdemServicoInput } from "../dtos/cancelar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Cancela a OS. A regra de "pode cancelar" (não concluída/não cancelada) é do
// Domain, via OrdemServico.cancelar(). O motivo obrigatório vira a descrição
// da alteração no histórico. Cancelamento é histórico, não exclusão.
export class CancelarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: CancelarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.cancelar({ descricao: input.motivo });

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
