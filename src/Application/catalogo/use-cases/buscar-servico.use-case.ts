import { Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";

// Input interno do caso de uso: sempre no escopo do negocioId.
export type BuscarServicoInput = {
  negocioId: string;
  servicoId: string;
};

// Busca um serviço pelo id dentro do negócio, evitando acesso entre negócios.
export class BuscarServicoUseCase {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async execute(input: BuscarServicoInput): Promise<Servico> {
    const servico = await this.servicosRepository.buscarPorId(
      input.negocioId,
      input.servicoId,
    );

    if (!servico) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    return servico;
  }
}
