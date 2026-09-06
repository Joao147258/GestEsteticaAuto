import {
  MetricasComerciais,
  MetricasFinanceiras,
  MetricasGerais,
  MetricasOperacionais,
} from '../../../Application/dashboard';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ConsultarDashboardQueryDto } from './dto';
import { DashboardPresenter } from './presenters/dashboard.presenter';

describe('DashboardController', () => {
  function montar() {
    const dashboardService = {
      obterResumoGeral: jest.fn(),
      obterResumoComercial: jest.fn(),
      obterResumoOperacional: jest.fn(),
      obterResumoFinanceiro: jest.fn(),
    } as unknown as DashboardService;

    const controller = new DashboardController(dashboardService);

    return { controller, dashboardService };
  }

  describe('obterResumoGeral (GET /admin/dashboard/geral)', () => {
    it('chama DashboardService.obterResumoGeral e retorna presenter formatado', async () => {
      const { controller, dashboardService } = montar();
      const mockGeral: MetricasGerais = {
        comercial: {
          orcamentosEmAberto: 5,
          valorEmNegociacao: 12500,
          valorAprovadoMes: 34000,
        },
        operacional: {
          ordensEmExecucao: 3,
          ordensConcluidas: 7,
          totalOrdensAtivas: 10,
        },
        financeiro: {
          totalAReceber: 15400,
          totalVencido: 2200,
          totalRecebidoMes: 28900,
        },
      };
      (dashboardService.obterResumoGeral as jest.Mock).mockResolvedValue(mockGeral);

      const query: ConsultarDashboardQueryDto = { negocioId: 'neg-1' };
      const resultado = await controller.obterResumoGeral(query);

      expect(dashboardService.obterResumoGeral).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(DashboardPresenter.geralToHTTP(mockGeral));
      expect(resultado.comercial.orcamentosEmAberto).toBe(5);
      expect(resultado.financeiro.totalRecebidoMes).toBe(28900);
    });
  });

  describe('obterResumoComercial (GET /admin/dashboard/comercial)', () => {
    it('chama DashboardService.obterResumoComercial e formata métricas comerciais', async () => {
      const { controller, dashboardService } = montar();
      const mockComercial: MetricasComerciais = {
        orcamentosPorStatus: {
          EM_ABERTO: 4,
          RASCUNHO: 2,
          ACEITO: 8,
          CANCELADO: 1,
        },
        valorEmNegociacao: 8500,
        valorAprovadoMes: 22000,
        totalOrcamentos: 15,
      };
      (dashboardService.obterResumoComercial as jest.Mock).mockResolvedValue(mockComercial);

      const query: ConsultarDashboardQueryDto = { negocioId: 'neg-1' };
      const resultado = await controller.obterResumoComercial(query);

      expect(dashboardService.obterResumoComercial).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(DashboardPresenter.comercialToHTTP(mockComercial));
      expect(resultado.totalOrcamentos).toBe(15);
      expect(resultado.orcamentosPorStatus.ACEITO).toBe(8);
    });
  });

  describe('obterResumoOperacional (GET /admin/dashboard/operacional)', () => {
    it('chama DashboardService.obterResumoOperacional e formata distribuição de OSs', async () => {
      const { controller, dashboardService } = montar();
      const mockOperacional: MetricasOperacionais = {
        ordensPorStatus: {
          ABERTA: 2,
          AGUARDANDO_VEICULO: 1,
          EM_EXECUCAO: 4,
          PAUSADA: 1,
          CONCLUIDA: 6,
          ENTREGUE: 12,
          CANCELADA: 0,
        },
        totalOrdens: 26,
      };
      (dashboardService.obterResumoOperacional as jest.Mock).mockResolvedValue(mockOperacional);

      const query: ConsultarDashboardQueryDto = { negocioId: 'neg-1' };
      const resultado = await controller.obterResumoOperacional(query);

      expect(dashboardService.obterResumoOperacional).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(DashboardPresenter.operacionalToHTTP(mockOperacional));
      expect(resultado.totalOrdens).toBe(26);
      expect(resultado.ordensPorStatus.EM_EXECUCAO).toBe(4);
    });
  });

  describe('obterResumoFinanceiro (GET /admin/dashboard/financeiro)', () => {
    it('chama DashboardService.obterResumoFinanceiro e formata métricas financeiras', async () => {
      const { controller, dashboardService } = montar();
      const mockFinanceiro: MetricasFinanceiras = {
        totalAReceber: 18000,
        totalVencido: 1500,
        totalRecebidoMes: 32000,
        titulosPorStatus: {
          ABERTO: 10,
          PARCIALMENTE_PAGO: 2,
          PAGO: 25,
          CANCELADO: 1,
        },
      };
      (dashboardService.obterResumoFinanceiro as jest.Mock).mockResolvedValue(mockFinanceiro);

      const query: ConsultarDashboardQueryDto = { negocioId: 'neg-1' };
      const resultado = await controller.obterResumoFinanceiro(query);

      expect(dashboardService.obterResumoFinanceiro).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(DashboardPresenter.financeiroToHTTP(mockFinanceiro));
      expect(resultado.totalAReceber).toBe(18000);
      expect(resultado.titulosPorStatus.PAGO).toBe(25);
    });
  });
});
