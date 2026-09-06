import { ValidationError } from '../../../Shared/errors/validation.error';
import { DashboardQueryRepository, MetricasGerais } from '../queries/dashboard-query.repository';
import { ObterResumoGeralUseCase } from './obter-resumo-geral.use-case';

describe('ObterResumoGeralUseCase', () => {
  it('consulta métricas gerais com sucesso', async () => {
    const mockGeral: MetricasGerais = {
      comercial: { orcamentosEmAberto: 2, valorEmNegociacao: 5000, valorAprovadoMes: 10000 },
      operacional: { ordensEmExecucao: 3, ordensConcluidas: 4, totalOrdensAtivas: 5 },
      financeiro: { totalAReceber: 8000, totalVencido: 0, totalRecebidoMes: 12000 },
    };

    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn().mockResolvedValue(mockGeral),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoGeralUseCase(repo);
    const resultado = await useCase.execute({ negocioId: 'neg-1' });

    expect(repo.obterMetricasGerais).toHaveBeenCalledWith({
      negocioId: 'neg-1',
      dataInicio: undefined,
      dataFim: undefined,
    });
    expect(resultado).toEqual(mockGeral);
  });

  it('lança erro se negocioId estiver ausente', async () => {
    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoGeralUseCase(repo);
    await expect(useCase.execute({ negocioId: '' })).rejects.toThrow(ValidationError);
  });
});
