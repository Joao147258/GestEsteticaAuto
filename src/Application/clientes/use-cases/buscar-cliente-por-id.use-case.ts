import { Injectable } from "@nestjs/common";
import type { Cliente } from "../../../Domain";
import type { BuscarClientePorIdInput } from "../dtos/buscar-cliente-por-id.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Busca um cliente pelo id sempre no escopo do negocioId,
// evitando que um negócio acesse cliente de outro.
// @Injectable: obrigatório para o Nest injetar o ClientesRepository.
@Injectable()
export class BuscarClientePorIdUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(input: BuscarClientePorIdInput): Promise<Cliente | null> {
    return this.clientesRepository.buscarPorId(
      input.negocioId,
      input.clienteId,
    );
  }
}
