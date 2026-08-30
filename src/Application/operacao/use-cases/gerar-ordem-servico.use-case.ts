import { OrdemServico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { OrcamentosRepository } from "../../comercial/repositories/OrcamentosRepository";
import type { GerarOrdemServicoInput } from "../dtos/gerar-ordem-servico.input";
import { OrcamentoNaoAprovadoError } from "../errors/OrcamentoNaoAprovadoError";
import { OrdensServicoRepository } from "../repositories/ordens-servico.repository";

// Gera uma Ordem de Serviço a partir de um orçamento ACEITO.
// Fluxo: buscar orçamento → validar aprovado → verificar idempotência
// (no máximo uma OS por orçamento) → criar OS com os itens do orçamento →
// salvar. Não recalcula preço, não baixa estoque, não cria pagamento.
// Idempotente: se já existe OS para o orçamento, retorna a existente.
export class GerarOrdemServicoUseCase {
  constructor(
    private readonly ordensServicoRepository: OrdensServicoRepository,
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async execute(input: GerarOrdemServicoInput): Promise<OrdemServico> {
    const orcamento = await this.orcamentosRepository.buscarPorId(
      input.negocioId,
      input.orcamentoId,
    );

    if (!orcamento) {
      throw new NotFoundError("Orçamento não encontrado.");
    }

    if (orcamento.status !== "ACEITO") {
      throw new OrcamentoNaoAprovadoError(
        `Orçamento ${input.orcamentoId} não está aprovado.`,
      );
    }

    const osExistente = await this.ordensServicoRepository.buscarPorOrcamento(
      input.negocioId,
      input.orcamentoId,
    );

    if (osExistente) {
      return osExistente;
    }

    // A OS exige veículo (trabalho executado no veículo) — o orçamento pode
    // não ter veículo associado. Essa validação é do escopo da criação aqui.
    if (!orcamento.veiculoId) {
      throw new ValidationError(
        "Orçamento sem veículo não pode gerar ordem de serviço.",
      );
    }

    const ordemServico = OrdemServico.criar({
      negocioId: input.negocioId,
      clienteId: orcamento.clienteId,
      veiculoId: orcamento.veiculoId,
      orcamentoId: orcamento.id,
      observacoes: orcamento.observacoes,
    });

    for (const item of orcamento.itens) {
      ordemServico.adicionarItem({
        servicoId: item.referenciaId ?? undefined,
        descricao: item.descricao,
        observacoes: item.observacoes ?? undefined,
      });
    }

    await this.ordensServicoRepository.salvar(ordemServico);

    return ordemServico;
  }
}
