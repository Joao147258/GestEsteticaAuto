import { Servico } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { CriarServicoInput } from "../dtos/criar-servico.input";
import { ServicosRepository } from "../repositories/servicos.repository";

// Orquestra a criação de um serviço: valida duplicidade de nome no negócio,
// delega a criação da entidade ao domínio e persiste via contrato.
export class CriarServicoUseCase {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async execute(input: CriarServicoInput): Promise<Servico> {
    const servicoExistente = await this.servicosRepository.buscarPorNome(
      input.negocioId,
      input.nome,
    );

    if (servicoExistente) {
      throw new ValidationError(
        "Já existe um serviço com este nome neste negócio.",
      );
    }
    // Cria a entidade de serviço usando o método de fábrica do domínio.
    const servico = Servico.criar({
      // Campos obrigatórios e opcionais do serviço.
      negocioId: input.negocioId,
      nome: input.nome,
      precoBase: input.precoBase,
      descricao: input.descricao ?? null,
      categoriaId: input.categoriaId ?? null,
      duracaoEstimadaMinutos: input.duracaoEstimadaMinutos ?? null,
      observacoes: input.observacoes ?? null,
    });

    await this.servicosRepository.salvar(servico);
    // Retorna a entidade criada para o chamador, que pode extrair o ID ou outros dados.
    return servico;
  }
}
