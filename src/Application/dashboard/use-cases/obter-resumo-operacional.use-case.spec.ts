import { ValidationError } from '../../../Shared/errors/validation.error';
import { DashboardQueryRepository, MetricasOperacionais } from '../queries/dashboard-query.repository';
import { ObterResumoOperacionalUseCase } from './obter-resumo-operacional.use-case';

describe('ObterResumoOperacionalUseCase', () => {
  it('consulta métricas operacionais com sucesso', async () => {
    const mockOperacional: MetricasOperacionais = {
      ordensPorStatus: {
        ABERTA: 1,
        AGUARDANDO_VEICULO: 0,
        EM_EXECUCAO: 2,
        PAUSADA: 0,
        CONCLUIDA: 3,
        ENTREGUE: 5,
        CANCELADA: 0,
      },
      totalOrdens: 11,
    };

    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn().mockResolvedValue(mockOperacional),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoOperacionalUseCase(repo);
    const resultado = await useCase.execute({ negocioId: 'neg-1' });

    expect(repo.obterMetricasOperacionais).toHaveBeenCalledWith({
      negocioId: 'neg-1',
      dataInicio: undefined,
      dataFim: undefined,
    });
    expect(resultado).toEqual(mockOperacional);
  });

  it('lança erro se negocioId estiver vazio', async () => {
    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoOperacionalUseCase(repo);
    await expect(useCase.execute({ negocioId: '' })).rejects.toThrow(ValidationError);
  });
});
