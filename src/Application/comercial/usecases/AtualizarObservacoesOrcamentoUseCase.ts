import { Orcamento } from "../../../Domain/comercial";
import type { AtualizarObservacoesOrcamentoDTO } from "../dtos/AtualizarObservacoesOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// AtualizarObservacoesOrcamentoUseCase — altera apenas as observações
// comerciais do orçamento (ex.: "cliente pediu desconto"). Não mexe em itens,
// status ou valores. A regra de editabilidade é do domínio.
export class AtualizarObservacoesOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(
    input: AtualizarObservacoesOrcamentoDTO,
  ): Promise<OrcamentoOutputDTO> {
    const orcamento: Orcamento | null =
      await this.orcamentosRepository.buscarPorId(
        input.negocioId,
        input.orcamentoId,
      );
    if (!orcamento) {
      throw new OrcamentoNaoEncontradoError(
        `Orçamento ${input.orcamentoId} não encontrado no negócio ${input.negocioId}.`,
      );
    }

    orcamento.atualizarObservacoes(input.observacoes ?? null);

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
