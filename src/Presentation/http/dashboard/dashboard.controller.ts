import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ConsultarDashboardQueryDto } from './dto';
import { DashboardPresenter } from './presenters/dashboard.presenter';

// DashboardController — rotas analíticas do painel administrativo do GestCorp Auto.
// Mapeado sob /admin/dashboard, alinhado à sub-skill Painel_Adm/04-dashboard e multi-tenant.
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /admin/dashboard/geral?negocioId=xxx
  // Retorna os indicadores consolidados dos cards da página principal.
  @Get('geral')
  async obterResumoGeral(@Query() query: ConsultarDashboardQueryDto) {
    const dados = await this.dashboardService.obterResumoGeral(query);
    return DashboardPresenter.geralToHTTP(dados);
  }

  // GET /admin/dashboard/comercial?negocioId=xxx
  // Retorna distribuição de orçamentos por status e valores em negociação/aprovados.
  @Get('comercial')
  async obterResumoComercial(@Query() query: ConsultarDashboardQueryDto) {
    const dados = await this.dashboardService.obterResumoComercial(query);
    return DashboardPresenter.comercialToHTTP(dados);
  }

  // GET /admin/dashboard/operacional?negocioId=xxx
  // Retorna contagem de Ordens de Serviço por cada status do ciclo produtivo da oficina.
  @Get('operacional')
  async obterResumoOperacional(@Query() query: ConsultarDashboardQueryDto) {
    const dados = await this.dashboardService.obterResumoOperacional(query);
    return DashboardPresenter.operacionalToHTTP(dados);
  }

  // GET /admin/dashboard/financeiro?negocioId=xxx
  // Retorna métricas de títulos pendentes, valores vencidos e recebimentos confirmados no mês.
  @Get('financeiro')
  async obterResumoFinanceiro(@Query() query: ConsultarDashboardQueryDto) {
    const dados = await this.dashboardService.obterResumoFinanceiro(query);
    return DashboardPresenter.financeiroToHTTP(dados);
  }
}
