import { Injectable } from "@nestjs/common";
import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { ConcluirOrdemServicoInput } from "../dtos/concluir-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Conclui a execução da OS. A regra de "pode concluir" (status EM_EXECUCAO/PAUSADA)
// é validada no Domain, via OrdemServico.concluir().
// Se houver itens ainda pendentes ou em andamento, conclui-os para assegurar a
// integridade de encerramento do serviço antes da transição da OS para CONCLUIDA.
// NÃO baixa estoque automaticamente — consumo é confirmado em fluxo próprio
// (ConfirmarConsumoInsumosItemOSUseCase).
@Injectable()
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

    // Se a OS estiver em execução, conclui automaticamente itens pendentes/em execução
    // para viabilizar a conclusão do trabalho no veículo sem inconsistência.
    if (
      ordemServico.status === "EM_EXECUCAO" ||
      ordemServico.status === "PAUSADA"
    ) {
      for (const item of ordemServico.itens) {
        if (item.status === "PENDENTE" || item.status === "EM_EXECUCAO") {
          ordemServico.concluirItem(item.id);
        }
      }
    }

    ordemServico.concluir();

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
