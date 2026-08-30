import { OrcamentoOutputDTO } from '../../../../Application/comercial';

// OrcamentoPresenter — ponto de projeção da resposta HTTP do orçamento.
// A camada de apresentação devolve a mesma forma do DTO de saída do use case
// (OrcamentoOutputDTO). Sem regra de negócio: apenas expõe o que a
// Application já produziu (origem, status, total e itens vêm calculados).
export class OrcamentoPresenter {
  static paraHttp(orcamento: OrcamentoOutputDTO): OrcamentoOutputDTO {
    return orcamento;
  }

  // Projeção da listagem: cada item já vem no formato de saída do use case.
  // Sem regra de negócio — apenas o contorno da coleção para o HTTP.
  static paraListaHttp(orcamentos: OrcamentoOutputDTO[]): OrcamentoOutputDTO[] {
    return orcamentos;
  }
}
