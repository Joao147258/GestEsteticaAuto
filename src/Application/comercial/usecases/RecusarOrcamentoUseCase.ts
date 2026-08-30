import { Orcamento } from "../../../Domain/comercial";
import type { RecusarOrcamentoDTO } from "../dtos/RecusarOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// RecusarOrcamentoUseCase — registra que o cliente não aceitou o orçamento.
// A regra de "pode recusar" (ex.: aprovado/cancelado não podem ser recusados)
// é do domínio, via Orcamento.recusar(). O motivo da recusa vai para as
// observações do aceite, preservando histórico comercial.
export class RecusarOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: RecusarOrcamentoDTO): Promise<OrcamentoOutputDTO> {
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

    orcamento.recusar(null, input.motivo ?? null);

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
