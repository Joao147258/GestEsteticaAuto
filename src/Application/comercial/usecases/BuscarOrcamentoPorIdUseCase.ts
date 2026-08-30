import { Orcamento } from "../../../Domain/comercial";
import type { BuscarOrcamentoPorIdDTO } from "../dtos/BuscarOrcamentoPorIdDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// BuscarOrcamentoPorIdUseCase — busca um orçamento pelo id sempre no escopo
// do negocioId (um negócio nunca acessa orçamento de outro). Se não achar,
// lança erro de aplicação para a Presentation transformar em HTTP 404.
export class BuscarOrcamentoPorIdUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: BuscarOrcamentoPorIdDTO): Promise<OrcamentoOutputDTO> {
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

    return OrcamentoMapper.paraOutput(orcamento);
  }
}
