import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../Shared/errors/validation.error';
import {
  ConsultarMetricasInput,
  DashboardQueryRepository,
  MetricasComerciais,
} from '../queries/dashboard-query.repository';

// ObterResumoComercialUseCase — consulta métricas de vendas e negociação de orçamentos por período.
@Injectable()
export class ObterResumoComercialUseCase {
  constructor(private readonly queryRepository: DashboardQueryRepository) {}

  async execute(input: ConsultarMetricasInput): Promise<MetricasComerciais> {
    const negocioId = input.negocioId?.trim();
    if (!negocioId) {
      throw new ValidationError('negocioId é obrigatório para consultar o dashboard comercial.');
    }

    return this.queryRepository.obterMetricasComerciais({
      negocioId,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }
}
