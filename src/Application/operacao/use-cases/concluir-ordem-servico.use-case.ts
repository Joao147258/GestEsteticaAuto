import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { ConcluirOrdemServicoInput } from "../dtos/concluir-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Conclui a execução da OS. A regra de "pode concluir" (todos os itens
// CONCLUIDOS, status EM_EXECUCAO/PAUSADA) é do Domain, via OrdemServico.concluir().
// NÃO baixa estoque automaticamente — consumo é confirmado em fluxo próprio
// (ConfirmarConsumoInsumosItemOSUseCase). O campo observacaoConclusao fica
// disponível no DTO para evolução futura.
export class ConcluirOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: ConcluirOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.concluir();

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
