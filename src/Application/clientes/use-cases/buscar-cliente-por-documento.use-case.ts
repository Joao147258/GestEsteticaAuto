import type { Cliente } from "../../../Domain";
import type { BuscarClientePorDocumentoInput } from "../dtos/buscar-cliente-por-documento.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Busca um cliente pelo documento no escopo do negocioId.
// Usado principalmente para validar duplicidade de documento.
export class BuscarClientePorDocumentoUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(
    input: BuscarClientePorDocumentoInput,
  ): Promise<Cliente | null> {
    return this.clientesRepository.buscarPorDocumento(
      input.negocioId,
      input.documento,
    );
  }
}
