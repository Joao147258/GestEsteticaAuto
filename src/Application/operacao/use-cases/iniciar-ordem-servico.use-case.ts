import type { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { IniciarOrdemServicoInput } from "../dtos/iniciar-ordem-servico.input";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Inicia a execução da OS. A regra de "pode iniciar" (ABERTA ou
// AGUARDANDO_VEICULO) é do Domain, via OrdemServico.iniciar() — a Application
// não muda status diretamente.
export class IniciarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
  ) {}

  async execute(input: IniciarOrdemServicoInput): Promise<OrdemServico> {
    const ordemServico = await this.ordensServicoRepository.buscarPorId(
      input.negocioId,
      input.ordemServicoId,
    );

    if (!ordemServico) {
      throw new NotFoundError("Ordem de serviço não encontrada.");
    }

    ordemServico.iniciar();

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
