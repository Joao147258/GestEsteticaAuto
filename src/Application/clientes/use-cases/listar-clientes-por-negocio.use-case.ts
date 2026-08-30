import type { Cliente } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { ListarClientesInput } from "../dtos/listar-clientes.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Lista clientes de um negócio com busca e paginação opcionais.
// Paginação padrão: página 1, até 20 registros.
export class ListarClientesPorNegocioUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(input: ListarClientesInput): Promise<Cliente[]> {
    const pagina = input.pagina ?? 1;
    const limite = input.limite ?? 20;

    if (pagina < 1) {
      throw new ValidationError("Página deve ser maior ou igual a 1.");
    }

    if (limite < 1 || limite > 100) {
      throw new ValidationError("Limite deve estar entre 1 e 100.");
    }

    return this.clientesRepository.listarPorNegocio({
      negocioId: input.negocioId,
      busca: input.busca,
      pagina,
      limite,
    });
  }
}
