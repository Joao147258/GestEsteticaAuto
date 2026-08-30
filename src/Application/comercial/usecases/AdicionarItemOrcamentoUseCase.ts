import { Orcamento } from "../../../Domain/comercial";
import type { AdicionarItemOrcamentoDTO } from "../dtos/AdicionarItemOrcamentoDTO";
import type { OrcamentoOutputDTO } from "../dtos/OrcamentoOutputDTO";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { ServicoNaoEncontradoError } from "../errors/ServicoNaoEncontradoError";
import { OrcamentoMapper } from "../mappers/OrcamentoMapper";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { ServicosRepository } from "../../catalogo/repositories/servicos.repository";

// AdicionarItemOrcamentoUseCase — inclui um serviço do catálogo num orçamento
// existente. Valida orçamento e serviço no escopo do negócio, delega a
// montagem do item ao domínio (que recalcula os totais) e salva.
export class AdicionarItemOrcamentoUseCase {
  constructor(
    private readonly orcamentosRepository: OrcamentosRepository,
    private readonly servicosRepository: ServicosRepository,
  ) {}

  async executar(
    input: AdicionarItemOrcamentoDTO,
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

    const servico = await this.servicosRepository.buscarPorId(
      input.negocioId,
      input.servicoId,
    );
    if (!servico) {
      throw new ServicoNaoEncontradoError(
        `Serviço ${input.servicoId} não encontrado no negócio ${input.negocioId}.`,
      );
    }

    // O domínio injeta negocioId/orcamentoId; aqui só passamos os dados da
    // linha negociada. A descrição é o snapshot do nome do serviço.
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: servico.id,
      descricao: servico.nome,
      quantidade: input.quantidade,
      valorUnitario: input.valorUnitario,
      observacoes: input.observacao ?? null,
    });

    await this.orcamentosRepository.salvar(orcamento);
    return OrcamentoMapper.paraOutput(orcamento);
  }
}
