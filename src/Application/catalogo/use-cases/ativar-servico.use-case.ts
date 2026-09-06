import { Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";

// Input interno do caso de uso: sempre no escopo do negocioId.
export type AtivarServicoInput = {
  negocioId: string;
  servicoId: string;
};

// Ativa um serviço previamente inativado chamando o método da entidade.
// Preserva a idempotência caso o serviço já esteja ativo e persiste o estado no repositório.
@Injectable()
export class AtivarServicoUseCase {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async execute(input: AtivarServicoInput): Promise<void> {
    const servico = await this.servicosRepository.buscarPorId(
      input.negocioId,
      input.servicoId,
    );

    if (!servico) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    servico.ativar();

    await this.servicosRepository.salvar(servico);
  }
}
