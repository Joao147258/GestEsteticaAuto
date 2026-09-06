import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../Shared/errors/validation.error';
import {
  ConsultarMetricasInput,
  DashboardQueryRepository,
  MetricasGerais,
} from '../queries/dashboard-query.repository';

// ObterResumoGeralUseCase — obtém os indicadores consolidados (comercial, operacional e financeiro)
// para alimentação da página inicial do painel administrativo.
@Injectable()
export class ObterResumoGeralUseCase {
  constructor(private readonly queryRepository: DashboardQueryRepository) {}

  async execute(input: ConsultarMetricasInput): Promise<MetricasGerais> {
    const negocioId = input.negocioId?.trim();
    if (!negocioId) {
      throw new ValidationError('negocioId é obrigatório para consultar o dashboard.');
    }

    return this.queryRepository.obterMetricasGerais({
      negocioId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }
}
