import { Cliente } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { CriarClienteInput } from "../dtos/criar-cliente.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Orquestra a criação de um cliente: valida duplicidade de documento,
// delega a criação da entidade ao domínio e persiste via contrato.
export class CriarClienteUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(input: CriarClienteInput): Promise<Cliente> {
    if (input.documento) {
      const clienteExistente = await this.clientesRepository.buscarPorDocumento(
        input.negocioId,
        input.documento,
      );

      if (clienteExistente) {
        throw new ValidationError(
          "Já existe um cliente com este documento neste negócio.",
        );
      }
    }

    const cliente = Cliente.criar({
      negocioId: input.negocioId,
      nome: input.nome,
      tipo: input.tipo,
      documento: input.documento ?? null,
      telefone: input.telefone ?? null,
      email: input.email ?? null,
    });

    await this.clientesRepository.salvar(cliente);

    return cliente;
  }
}
