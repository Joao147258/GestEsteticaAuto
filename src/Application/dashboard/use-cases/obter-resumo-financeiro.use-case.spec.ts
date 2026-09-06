import { ValidationError } from '../../../Shared/errors/validation.error';
import { DashboardQueryRepository, MetricasFinanceiras } from '../queries/dashboard-query.repository';
import { ObterResumoFinanceiroUseCase } from './obter-resumo-financeiro.use-case';

describe('ObterResumoFinanceiroUseCase', () => {
  it('consulta métricas financeiras com sucesso', async () => {
    const mockFinanceiro: MetricasFinanceiras = {
      totalAReceber: 10000,
      totalVencido: 1000,
      totalRecebidoMes: 15000,
      titulosPorStatus: { ABERTO: 5, PARCIALMENTE_PAGO: 1, PAGO: 8, CANCELADO: 0 },
    };

    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn().mockResolvedValue(mockFinanceiro),
    };

    const useCase = new ObterResumoFinanceiroUseCase(repo);
    const resultado = await useCase.execute({ negocioId: 'neg-1' });

    expect(repo.obterMetricasFinanceiras).toHaveBeenCalledWith({
      negocioId: 'neg-1',
      dataInicio: undefined,
      dataFim: undefined,
    });
    expect(resultado).toEqual(mockFinanceiro);
  });

  it('lança erro se negocioId estiver vazio', async () => {
    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoFinanceiroUseCase(repo);
    await expect(useCase.execute({ negocioId: '' })).rejects.toThrow(ValidationError);
  });
});
