import { Orcamento } from "../../../Domain/comercial";
import type { CancelarOrcamentoDTO } from "../dtos/CancelarOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// CancelarOrcamentoUseCase — invalida o orçamento por decisão interna da
// empresa (não é recusa do cliente). A regra de "pode cancelar" (ex.: já
// finalizado não pode) é do domínio, via Orcamento.cancelar(). O motivo vai
// para a descrição do registro de alteração.
export class CancelarOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: CancelarOrcamentoDTO): Promise<OrcamentoOutputDTO> {
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

    orcamento.cancelar({ descricao: input.motivo ?? null });

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
