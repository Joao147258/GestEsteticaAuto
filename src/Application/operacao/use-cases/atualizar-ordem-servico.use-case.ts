import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { AtualizarOrdemServicoInput } from "../dtos/atualizar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Atualiza dados operacionais simples (observações e previsões), sem mudar
// status — troca de status passa pelos use-cases específicos (iniciar/pausar/
// concluir/cancelar). A regra do que é editável é do Domain, via
// OrdemServico.atualizarDadosOperacionais().
export class AtualizarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: AtualizarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.atualizarDadosOperacionais({
      observacoes: input.observacoes,
      previsaoInicio: input.previsaoInicio,
      previsaoConclusao: input.previsaoConclusao,
    });

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
