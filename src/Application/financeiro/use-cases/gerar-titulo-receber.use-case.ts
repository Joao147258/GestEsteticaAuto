import { TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { OrcamentosRepository } from "../../comercial/repositories/OrcamentosRepository";
import type { GerarTituloReceberInput } from "../dtos/gerar-titulo-receber.input";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";

// Gera um título a receber a partir de uma origem. V1: a origem principal é
// o orçamento ACEITO (origem ORCAMENTO + origemId = orcamentoId).
// Idempotente: se já existe título para a origem, retorna o existente (evita
// duplicidade financeira para o mesmo orçamento). A regra de "pode gerar"
// (parcelas, valores, soma) é do Domain, via TituloFinanceiro.criar.
export class GerarTituloReceberUseCase {
  constructor(
    private readonly titulosReceberRepository: TitulosReceberRepository,
    private readonly orcamentosRepository: OrcamentosRepository,
  ) {}

  async execute(input: GerarTituloReceberInput): Promise<TituloFinanceiro> {
    const tituloExistente =
      await this.titulosReceberRepository.buscarPorOrigem(
        input.negocioId,
        input.origem,
        input.origemId,
      );
    if (tituloExistente) {
      return tituloExistente;
    }

    if (input.origem === "ORCAMENTO") {
      const orcamento = await this.orcamentosRepository.buscarPorId(
        input.negocioId,
        input.origemId,
      );
      if (!orcamento) {
        throw new NotFoundError("Orçamento não encontrado.");
      }
      if (orcamento.status !== "ACEITO") {
        throw new ValidationError(
          "Apenas orçamentos aprovados podem gerar título financeiro.",
        );
      }
    }

    const titulo = TituloFinanceiro.criar({
      negocioId: input.negocioId,
      origem: input.origem,
      origemId: input.origemId,
      clienteId: input.clienteId,
      descricao: input.descricao,
      valorOriginal: input.valorOriginal,
      valorDesconto: input.valorDesconto,
      valorAcrescimo: input.valorAcrescimo,
      dataEmissao: input.dataEmissao,
      dataVencimento: input.dataVencimento,
      parcelas: input.parcelas,
      observacoes: input.observacoes,
    });

    await this.titulosReceberRepository.salvar(titulo);

    return titulo;
  }
}
