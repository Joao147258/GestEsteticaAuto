import { Injectable } from '@nestjs/common';
import {
  CalcularConsumoInsumosItemOSUseCase,
  ConfirmarConsumoInsumosItemOSUseCase,
} from '../../../Application/operacao';

// OrdensServicoService — camada de orquestração HTTP para operações de Ordem de Serviço.
// Faz a ponte entre os controladores da Presentation e os use-cases da Application.
@Injectable()
export class OrdensServicoService {
  constructor(
    private readonly calcularConsumoUseCase: CalcularConsumoInsumosItemOSUseCase,
    private readonly confirmarConsumoUseCase: ConfirmarConsumoInsumosItemOSUseCase,
  ) {}

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
