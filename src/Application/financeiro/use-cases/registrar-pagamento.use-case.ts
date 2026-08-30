import { TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { RegistrarPagamentoInput } from "../dtos/registrar-pagamento.input";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";

// Registra um pagamento (parcial ou total) em uma parcela do título e salva.
// Quem decide se o título fica ABERTO/PARCIALMENTE_PAGO/PAGO é o Domain
// (TituloFinanceiro recalcula status) — a Application não mexe em valores nem
// status diretamente.
// Decisão V1: o pagamento nasce PENDENTE no domínio e só CONFIRMADO compõe o
// valor pago. Como a V1 não tem fluxo separado de confirmação manual, o
// use-case confirma na sequência — o Domain valida saldo e recalcula status.
export class RegistrarPagamentoUseCase {
  constructor(
    private readonly titulosReceberRepository: TitulosReceberRepository,
  ) {}

  async execute(input: RegistrarPagamentoInput): Promise<TituloFinanceiro> {
    const titulo = await this.titulosReceberRepository.buscarPorId(
      input.negocioId,
      input.tituloId,
    );

    if (!titulo) {
      throw new NotFoundError("Título financeiro não encontrado.");
    }

    const pagamentoId = titulo.registrarPagamento({
      parcelaFinanceiraId: input.parcelaFinanceiraId,
      valor: input.valor,
      formaPagamentoId: input.formaPagamentoId,
      formaPagamentoDescricao: input.formaPagamentoDescricao ?? "",
      dataPagamento: input.dataPagamento,
      observacoes: input.observacao,
    });

    titulo.confirmarPagamento(pagamentoId);

    await this.titulosReceberRepository.salvar(titulo);

    return titulo;
  }
}
