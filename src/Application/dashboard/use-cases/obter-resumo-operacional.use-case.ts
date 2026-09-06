import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../Shared/errors/validation.error';
import {
  ConsultarMetricasInput,
  DashboardQueryRepository,
  MetricasOperacionais,
} from '../queries/dashboard-query.repository';

// ObterResumoOperacionalUseCase — consulta a distribuição de Ordens de Serviço por status no período.
@Injectable()
export class ObterResumoOperacionalUseCase {
  constructor(private readonly queryRepository: DashboardQueryRepository) {}

  async execute(input: ConsultarMetricasInput): Promise<MetricasOperacionais> {
    const negocioId = input.negocioId?.trim();
    if (!negocioId) {
      throw new ValidationError('negocioId é obrigatório para consultar o dashboard operacional.');
    }

    return this.queryRepository.obterMetricasOperacionais({
      negocioId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }
}
