import { Orcamento } from "../../../Domain/comercial";
import type { AbrirOrcamentoDTO } from "../dtos/AbrirOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// AbrirOrcamentoUseCase — libera o orçamento montado para aceite do cliente
// (RASCUNHO → EM_ABERTO). A regra de "pode abrir" (apenas RASCUNHO) é do
// domínio, via Orcamento.abrir() — a use case não muda status diretamente.
// Sem este elo de aplicação, o orçamento criado pelo painel nunca chega a
// EM_ABERTO e o AprovarOrcamentoUseCase (Orcamento.aceitar()) rejeitaria a
// aprovação com status RASCUNHO.
export class AbrirOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: AbrirOrcamentoDTO): Promise<OrcamentoOutputDTO> {
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

    orcamento.abrir();

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
