import { TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import type { CancelarTituloReceberInput } from "../dtos/cancelar-titulo-receber.input";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";

// Cancela um título a receber. Cancelamento é estado/histórico, não exclusão:
// o Domain mantém o título com motivo e histórico. A regra de "pode cancelar"
// (não pago, sem pagamento confirmado) é do Domain, via TituloFinanceiro.cancelar.
export class CancelarTituloReceberUseCase {
  constructor(
    private readonly titulosReceberRepository: TitulosReceberRepository,
  ) {}

  async execute(input: CancelarTituloReceberInput): Promise<TituloFinanceiro> {
    const titulo = await this.titulosReceberRepository.buscarPorId(
      input.negocioId,
      input.tituloId,
    );

    if (!titulo) {
      throw new NotFoundError("Título financeiro não encontrado.");
    }

    titulo.cancelar(input.motivo);

    await this.titulosReceberRepository.salvar(titulo);

    return titulo;
  }
}
