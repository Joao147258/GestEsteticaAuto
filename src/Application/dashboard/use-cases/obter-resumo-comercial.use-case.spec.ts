import { ValidationError } from '../../../Shared/errors/validation.error';
import { DashboardQueryRepository, MetricasComerciais } from '../queries/dashboard-query.repository';
import { ObterResumoComercialUseCase } from './obter-resumo-comercial.use-case';

describe('ObterResumoComercialUseCase', () => {
  it('consulta métricas comerciais com sucesso', async () => {
    const mockComercial: MetricasComerciais = {
      orcamentosPorStatus: { EM_ABERTO: 1, RASCUNHO: 0, ACEITO: 2, CANCELADO: 0 },
      valorEmNegociacao: 1500,
      valorAprovadoMes: 5000,
      totalOrcamentos: 3,
    };

    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn().mockResolvedValue(mockComercial),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoComercialUseCase(repo);
    const resultado = await useCase.execute({ negocioId: 'neg-1' });

    expect(repo.obterMetricasComerciais).toHaveBeenCalledWith({
      negocioId: 'neg-1',
      dataInicio: undefined,
      dataFim: undefined,
    });
    expect(resultado).toEqual(mockComercial);
  });

  it('lança erro se negocioId estiver vazio', async () => {
    const repo: DashboardQueryRepository = {
      obterMetricasGerais: jest.fn(),
      obterMetricasComerciais: jest.fn(),
      obterMetricasOperacionais: jest.fn(),
      obterMetricasFinanceiras: jest.fn(),
    };

    const useCase = new ObterResumoComercialUseCase(repo);
    await expect(useCase.execute({ negocioId: '   ' })).rejects.toThrow(ValidationError);
  });
});
