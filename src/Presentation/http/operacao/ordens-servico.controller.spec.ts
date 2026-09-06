import {
  ResultadoConfirmacaoConsumoItemOS,
  SugestaoConsumoInsumoItem,
} from '../../../Application/operacao';
import { ConfirmarConsumoItemOsDto } from './dto/confirmar-consumo-item-os.dto';
import { ConsultarConsumoPrevistoQueryDto } from './dto/consultar-consumo-previsto-query.dto';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';
import { ConsumoInsumosItemOsPresenter } from './presenters/consumo-insumos-item-os.presenter';

// Testes unitários do OrdensServicoController para as rotas de consumo de insumos na operação.
describe('OrdensServicoController', () => {
  function montar() {
    const ordensServicoService = {
      calcularConsumoPrevisto: jest.fn(),
      confirmarConsumo: jest.fn(),
    } as unknown as OrdensServicoService;

    const controller = new OrdensServicoController(ordensServicoService);

    return { controller, ordensServicoService };
  }

  describe('obterConsumoPrevisto (GET /admin/ordens-servico/:osId/itens/:itemId/consumo-previsto)', () => {
    it('chama OrdensServicoService.calcularConsumoPrevisto com params e query e devolve o presenter formatado', async () => {
      const { controller, ordensServicoService } = montar();
      const sugestoes: SugestaoConsumoInsumoItem[] = [
        { produtoId: 'prod-shampoo', quantidadePrevista: 50, unidadeMedida: 'ML' },
        { produtoId: 'prod-pano', quantidadePrevista: 1, unidadeMedida: 'UNIDADE' },
      ];
      (ordensServicoService.calcularConsumoPrevisto as jest.Mock).mockResolvedValue(sugestoes);

      const query: ConsultarConsumoPrevistoQueryDto = { negocioId: 'neg-1' };
      const resultado = await controller.obterConsumoPrevisto('os-100', 'item-1', query);

      expect(ordensServicoService.calcularConsumoPrevisto).toHaveBeenCalledWith('neg-1', 'os-100', 'item-1');
      expect(resultado).toEqual(
        ConsumoInsumosItemOsPresenter.sugestaoToHTTP('os-100', 'item-1', sugestoes),
      );
      expect(resultado).toEqual({
        osId: 'os-100',
        itemId: 'item-1',
        insumosPrevistos: [
          { produtoId: 'prod-shampoo', quantidadePrevista: 50, unidadeMedida: 'ML' },
          { produtoId: 'prod-pano', quantidadePrevista: 1, unidadeMedida: 'UNIDADE' },
        ],
      });
    });
  });

  describe('confirmarConsumo (POST /admin/ordens-servico/:osId/itens/:itemId/confirmar-consumo)', () => {
    it('chama OrdensServicoService.confirmarConsumo com negocioId do body e devolve o resultado formatado', async () => {
      const { controller, ordensServicoService } = montar();
      const confirmacao: ResultadoConfirmacaoConsumoItemOS = {
        realizados: [
          { produtoId: 'prod-shampoo', quantidade: 0.05, unidadeMedida: 'LITRO' },
        ],
        jaRegistrados: [],
        insuficientes: [],
        alertasEstoqueMinimo: [
          { produtoId: 'prod-shampoo', quantidadeAtual: 0.95, estoqueMinimo: 1 },
        ],
        custoEstimado: 2.35,
        possuiCustosDesconhecidos: false,
      };
      (ordensServicoService.confirmarConsumo as jest.Mock).mockResolvedValue(confirmacao);

      const body: ConfirmarConsumoItemOsDto = { negocioId: 'neg-1' };
      const resultado = await controller.confirmarConsumo('os-100', 'item-1', body, undefined);

      expect(ordensServicoService.confirmarConsumo).toHaveBeenCalledWith('neg-1', 'os-100', 'item-1');
      expect(resultado).toEqual(
        ConsumoInsumosItemOsPresenter.confirmacaoToHTTP('os-100', 'item-1', confirmacao),
      );
      expect(resultado.realizados).toHaveLength(1);
      expect(resultado.alertasEstoqueMinimo).toHaveLength(1);
      expect(resultado.custoEstimado).toBe(2.35);
    });

    it('aceita negocioId via query string como fallback quando omitido no body', async () => {
      const { controller, ordensServicoService } = montar();
      const confirmacao: ResultadoConfirmacaoConsumoItemOS = {
        realizados: [],
        jaRegistrados: [{ produtoId: 'prod-shampoo' }],
        insuficientes: [],
        alertasEstoqueMinimo: [],
        custoEstimado: 0,
        possuiCustosDesconhecidos: false,
      };
      (ordensServicoService.confirmarConsumo as jest.Mock).mockResolvedValue(confirmacao);

      const resultado = await controller.confirmarConsumo(
        'os-100',
        'item-1',
        {} as ConfirmarConsumoItemOsDto,
        'neg-1',
      );

      expect(ordensServicoService.confirmarConsumo).toHaveBeenCalledWith('neg-1', 'os-100', 'item-1');
      expect(resultado.jaRegistrados).toEqual([{ produtoId: 'prod-shampoo' }]);
    });

    it('formata respostas parciais com itens insuficientes', async () => {
      const { controller, ordensServicoService } = montar();
      const confirmacao: ResultadoConfirmacaoConsumoItemOS = {
        realizados: [],
        jaRegistrados: [],
        insuficientes: [
          { produtoId: 'prod-cera', motivo: 'Saldo insuficiente para baixar' },
        ],
        alertasEstoqueMinimo: [],
        custoEstimado: 0,
        possuiCustosDesconhecidos: true,
      };
      (ordensServicoService.confirmarConsumo as jest.Mock).mockResolvedValue(confirmacao);

      const resultado = await controller.confirmarConsumo('os-100', 'item-1', { negocioId: 'neg-1' });

      expect(resultado.insuficientes).toHaveLength(1);
      expect(resultado.insuficientes[0].motivo).toBe('Saldo insuficiente para baixar');
      expect(resultado.possuiCustosDesconhecidos).toBe(true);
    });
  });
});
