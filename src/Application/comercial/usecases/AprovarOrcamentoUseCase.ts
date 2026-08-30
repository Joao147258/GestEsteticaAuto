import { Orcamento } from "../../../Domain/comercial";
import type { AprovarOrcamentoDTO } from "../dtos/AprovarOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";

// AprovarOrcamentoUseCase — registra que o cliente aceitou o orçamento.
// A regra de "pode aprovar" (status EM_ABERTO, itens presentes) é do domínio,
// via Orcamento.aceitar() — a use case não muda status diretamente.
export class AprovarOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async executar(input: AprovarOrcamentoDTO): Promise<OrcamentoOutputDTO> {
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

    orcamento.aceitar();

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
