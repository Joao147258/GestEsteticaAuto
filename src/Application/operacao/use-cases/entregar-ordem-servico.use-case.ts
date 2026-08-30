import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { EntregarOrdemServicoInput } from "../dtos/entregar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Entrega a OS ao cliente. A regra de "pode entregar" (apenas CONCLUIDA) é do
// Domain, via OrdemServico.entregar() — a Application não muda status
// diretamente. Segue o padrão dos demais use cases de status da OS:
// buscar → chamar o domínio → salvar → retornar.
export class EntregarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: EntregarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.entregar();

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
