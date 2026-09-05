import { Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RemoverClienteInput } from "../dtos/remover-cliente.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Remove (ou inativa, conforme a Infrastructure decidir) um cliente.
// Só remove se o cliente existir no escopo do negocioId.
// @Injectable: obrigatório para o Nest injetar o ClientesRepository.
@Injectable()
export class RemoverClienteUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(input: RemoverClienteInput): Promise<void> {
    const cliente = await this.clientesRepository.buscarPorId(
      input.negocioId,
      input.clienteId,
    );

    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado.");
    }

    await this.clientesRepository.remover(input.negocioId, input.clienteId);
  }
}
