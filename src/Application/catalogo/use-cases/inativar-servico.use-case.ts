import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";

// Input interno do caso de uso: sempre no escopo do negocioId.
export type InativarServicoInput = {
  negocioId: string;
  servicoId: string;
};

// Inativa um serviço chamando o método da entidade (não apaga o registro,
// preservando orçamentos e ordens de serviço que o referenciam).
export class InativarServicoUseCase {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async execute(input: InativarServicoInput): Promise<void> {
    const servico = await this.servicosRepository.buscarPorId(
      input.negocioId,
      input.servicoId,
    );

    if (!servico) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    servico.inativar();

    await this.servicosRepository.salvar(servico);
  }
}
