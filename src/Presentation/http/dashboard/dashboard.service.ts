import { Injectable } from '@nestjs/common';
import {
  ObterResumoComercialUseCase,
  ObterResumoFinanceiroUseCase,
  ObterResumoGeralUseCase,
  ObterResumoOperacionalUseCase,
} from '../../../Application/dashboard';
import { ConsultarDashboardQueryDto } from './dto';

// DashboardService — orquestrador de apresentação para as consultas e indicadores analíticos do Dashboard.
// Recebe as requisições HTTP, converte parâmetros de data e delega a execução para os respectivos use-cases.
@Injectable()
export class DashboardService {
  constructor(
    private readonly obterResumoGeralUseCase: ObterResumoGeralUseCase,
    private readonly obterResumoComercialUseCase: ObterResumoComercialUseCase,
    private readonly obterResumoOperacionalUseCase: ObterResumoOperacionalUseCase,
    private readonly obterResumoFinanceiroUseCase: ObterResumoFinanceiroUseCase,
  ) {}

  // Consulta o resumo consolidado geral (home do painel).
  async obterResumoGeral(dto: ConsultarDashboardQueryDto) {
    return this.obterResumoGeralUseCase.execute({
      negocioId: dto.negocioId,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
    });
  }

  // Consulta indicadores comerciais de orçamentos e conversão.
  async obterResumoComercial(dto: ConsultarDashboardQueryDto) {
    return this.obterResumoComercialUseCase.execute({
      negocioId: dto.negocioId,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
    });
  }

  // Consulta indicadores operacionais de Ordens de Serviço por status.
  async obterResumoOperacional(dto: ConsultarDashboardQueryDto) {
    return this.obterResumoOperacionalUseCase.execute({
      negocioId: dto.negocioId,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
    });
  }

  // Consulta indicadores financeiros de inadimplência, a receber e faturamento mensal.
  async obterResumoFinanceiro(dto: ConsultarDashboardQueryDto) {
    return this.obterResumoFinanceiroUseCase.execute({
      negocioId: dto.negocioId,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
    });
  }
}
