import { Servico } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ServicosRepository } from "../repositories/servicos.repository";

// Filtros internos da listagem. ativo opcional: true só ativos,
// false só inativos, ausente todos.
export type ListarServicosInput = {
  negocioId: string;
  busca?: string;
  pagina?: number;
  limite?: number;
  ativo?: boolean;
};

// Lista serviços de um negócio com busca, filtro de status e paginação.
// Valores padrão definidos na Application (página 1, limite 20).
export class ListarServicosUseCase {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async execute(input: ListarServicosInput): Promise<Servico[]> {
    const pagina = input.pagina ?? 1;
    const limite = input.limite ?? 20;

    if (pagina < 1) {
      throw new ValidationError("Página deve ser maior ou igual a 1.");
    }

    if (limite < 1 || limite > 100) {
      throw new ValidationError("Limite deve estar entre 1 e 100.");
    }

    return this.servicosRepository.listarPorNegocio({
      negocioId: input.negocioId,
      busca: input.busca,
      pagina,
      limite,
      ativo: input.ativo,
    });
  }
}
