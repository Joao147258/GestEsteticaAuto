import { Injectable } from '@nestjs/common';
import {
  AtualizarOrdemServicoUseCase,
  BuscarOrdemServicoUseCase,
  CalcularConsumoInsumosItemOSUseCase,
  CancelarOrdemServicoUseCase,
  ConcluirOrdemServicoUseCase,
  ConfirmarConsumoInsumosItemOSUseCase,
  EntregarOrdemServicoUseCase,
  GerarOrdemServicoUseCase,
  IniciarOrdemServicoUseCase,
  ListarOrdensServicoInput,
  ListarOrdensServicoUseCase,
  PausarOrdemServicoUseCase,
} from '../../../Application/operacao';

// OrdensServicoService — camada de orquestração da Presentation para Ordens de Serviço.
// Centraliza a injeção dos 11 use-cases de Operação (ciclo de vida e consumo de insumos),
// delegando estritamente a execução sem reter regras de domínio nem acessar a infraestrutura diretamente.
@Injectable()
export class OrdensServicoService {
  constructor(
    private readonly gerarOrdemServicoUseCase: GerarOrdemServicoUseCase,
    private readonly buscarOrdemServicoUseCase: BuscarOrdemServicoUseCase,
    private readonly listarOrdensServicoUseCase: ListarOrdensServicoUseCase,
    private readonly atualizarOrdemServicoUseCase: AtualizarOrdemServicoUseCase,
    private readonly iniciarOrdemServicoUseCase: IniciarOrdemServicoUseCase,
    private readonly pausarOrdemServicoUseCase: PausarOrdemServicoUseCase,
    private readonly concluirOrdemServicoUseCase: ConcluirOrdemServicoUseCase,
    private readonly entregarOrdemServicoUseCase: EntregarOrdemServicoUseCase,
    private readonly cancelarOrdemServicoUseCase: CancelarOrdemServicoUseCase,
    private readonly calcularConsumoUseCase: CalcularConsumoInsumosItemOSUseCase,
    private readonly confirmarConsumoUseCase: ConfirmarConsumoInsumosItemOSUseCase,
  ) {}

  // Gera uma OS a partir de um orçamento com status ACEITO.
  // Aplica garantia de idempotência no use-case (retorna OS existente se já tiver sido gerada).
  async gerar(negocioId: string, orcamentoId: string) {
    return this.gerarOrdemServicoUseCase.execute({ negocioId, orcamentoId });
  }

  // Busca uma Ordem de Serviço por ID garantindo isolamento estrito de tenant (negocioId).
  // Dispara NotFoundError caso a OS não pertença ao negócio informado.
  async buscarPorId(negocioId: string, ordemServicoId: string) {
    return this.buscarOrdemServicoUseCase.execute({ negocioId, ordemServicoId });
  }

  // Lista ordens de serviço do negócio com suporte a múltiplos filtros (status, cliente, veículo, período).
  async listar(input: ListarOrdensServicoInput) {
    return this.listarOrdensServicoUseCase.execute(input);
  }

  // Atualiza observações operacionais e datas previstas de início e conclusão.
  // Não altera o status da OS (status possui use-cases específicos com máquina de estados).
  async atualizar(input: {
    negocioId: string;
    ordemServicoId: string;
    observacoes?: string;
    previsaoInicio?: Date;
    previsaoConclusao?: Date;
  }) {
    return this.atualizarOrdemServicoUseCase.execute(input);
  }

  // Transiciona o status da OS para EM_EXECUCAO.
  // O domínio valida se o status atual permite o início (ABERTA ou AGUARDANDO_VEICULO).
  async iniciar(negocioId: string, ordemServicoId: string) {
    return this.iniciarOrdemServicoUseCase.execute({ negocioId, ordemServicoId });
  }

  // Pausa uma OS em andamento, transicionando o status para PAUSADA.
  // O domínio exige que a OS esteja em EM_EXECUCAO para permitir a pausa.
  async pausar(negocioId: string, ordemServicoId: string, motivo?: string) {
    return this.pausarOrdemServicoUseCase.execute({ negocioId, ordemServicoId, motivo });
  }

  // Conclui a execução dos serviços na OS, transicionando o status para CONCLUIDA.
  // O domínio valida que a OS esteja em execução ou pausada e que seus itens estejam prontos.
  async concluir(negocioId: string, ordemServicoId: string, observacaoConclusao?: string) {
    return this.concluirOrdemServicoUseCase.execute({
      negocioId,
      ordemServicoId,
      observacaoConclusao,
    });
  }

  // Registra a entrega formal do veículo/serviço ao cliente, transicionando para ENTREGUE.
  // O domínio só permite entregar uma OS que já esteja com status CONCLUIDA.
  async entregar(negocioId: string, ordemServicoId: string) {
    return this.entregarOrdemServicoUseCase.execute({ negocioId, ordemServicoId });
  }

  // Cancela a OS registrando o motivo mandatório no histórico de auditoria.
  // O domínio impede o cancelamento de OS já CONCLUIDA ou já CANCELADA.
  async cancelar(negocioId: string, ordemServicoId: string, motivo: string) {
    return this.cancelarOrdemServicoUseCase.execute({ negocioId, ordemServicoId, motivo });
  }

  // Calcula os insumos previstos para execução de um item de OS baseado na ficha técnica do catálogo.
  // Operação estritamente de leitura (não altera saldos de estoque).
  async calcularConsumoPrevisto(
    negocioId: string,
    ordemServicoId: string,
    itemOrdemServicoId: string,
  ) {
    return this.calcularConsumoUseCase.execute({
      negocioId,
      ordemServicoId,
      itemOrdemServicoId,
    });
  }

  // Efetiva a baixa de insumos no estoque interno com validação de idempotência e conversão de unidades.
  // Garante que o mesmo item de OS não seja baixado duas vezes e gera alertas de estoque mínimo.
  async confirmarConsumo(
    negocioId: string,
    ordemServicoId: string,
    itemOrdemServicoId: string,
  ) {
    return this.confirmarConsumoUseCase.execute({
      negocioId,
      ordemServicoId,
      itemOrdemServicoId,
    });
  }
}
