import type { Cliente } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { AtualizarClienteInput } from "../dtos/atualizar-cliente.input";
import { ClientesRepository } from "../repositories/clientes.repository";

// Orquestra a atualização de um cliente existente: busca no escopo do
// negocioId, valida duplicidade de documento e delega as alterações ao
// domínio antes de persistir via contrato.
export class AtualizarClienteUseCase {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async execute(input: AtualizarClienteInput): Promise<Cliente> {
    const cliente = await this.clientesRepository.buscarPorId(
      input.negocioId,
      input.clienteId,
    );

    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado.");
    }

    if (input.documento) {
      const clienteComDocumento =
        await this.clientesRepository.buscarPorDocumento(
          input.negocioId,
          input.documento,
        );

      if (clienteComDocumento && clienteComDocumento.id !== cliente.id) {
        throw new ValidationError(
          "Já existe outro cliente com este documento neste negócio.",
        );
      }
    }

    if (input.nome !== undefined) {
      cliente.atualizarNome(input.nome);
    }

    if (input.documento !== undefined) {
      cliente.atualizarDocumento(input.documento);
    }

    if (input.telefone !== undefined) {
      cliente.atualizarTelefone(input.telefone);
    }

    if (input.email !== undefined) {
      cliente.atualizarEmail(input.email);
    }

    await this.clientesRepository.salvar(cliente);

    return cliente;
  }
}
