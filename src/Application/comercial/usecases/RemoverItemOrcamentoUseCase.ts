import { Injectable } from "@nestjs/common";
import { Orcamento } from "../../../Domain/comercial";
import type { RemoverItemOrcamentoDTO } from "../dtos/RemoverItemOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// RemoverItemOrcamentoUseCase — remove uma linha específica do orçamento.
// Remove pelo itemId (não por servicoId): o mesmo serviço pode aparecer mais
// de uma vez com condições diferentes. A regra de poder remover (status
// editável, item existente) é do domínio e propaga para cá.
@Injectable()
export class RemoverItemOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(
    input: RemoverItemOrcamentoDTO,
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

    orcamento.removerItem(input.itemId);

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
