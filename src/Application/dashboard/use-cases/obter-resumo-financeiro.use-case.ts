import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../Shared/errors/validation.error';
import {
  ConsultarMetricasInput,
  DashboardQueryRepository,
  MetricasFinanceiras,
} from '../queries/dashboard-query.repository';

// ObterResumoFinanceiroUseCase — consulta métricas financeiras (total a receber, vencido e recebido no mês).
@Injectable()
export class ObterResumoFinanceiroUseCase {
  constructor(private readonly queryRepository: DashboardQueryRepository) {}

  async execute(input: ConsultarMetricasInput): Promise<MetricasFinanceiras> {
    const negocioId = input.negocioId?.trim();
    if (!negocioId) {
      throw new ValidationError('negocioId é obrigatório para consultar o dashboard financeiro.');
    }

    return this.queryRepository.obterMetricasFinanceiras({
      negocioId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }
}
