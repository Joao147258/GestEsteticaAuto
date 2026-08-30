import { Servico } from "../../../Domain";

// Contrato de persistência que a Application precisa para os casos de uso
// de serviços. Não sabe de onde vêm os dados (banco, API, mock).
// Sem remover: no catálogo, serviços são inativados para preservar o histórico
// de orçamentos e ordens de serviço que os referenciam.
export abstract class ServicosRepository {
  abstract salvar(servico: Servico): Promise<void>;

  abstract buscarPorId(
    negocioId: string,
    servicoId: string,
  ): Promise<Servico | null>;

  abstract buscarPorNome(
    negocioId: string,
    nome: string,
  ): Promise<Servico | null>;

  abstract listarPorNegocio(params: {
    negocioId: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    ativo?: boolean;
  }): Promise<Servico[]>;
}
