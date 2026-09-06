import { TituloFinanceiro } from '../../../Domain';
import {
  CancelarTituloReceberDto,
  GerarTituloReceberDto,
  ListarTitulosReceberQueryDto,
  RegistrarPagamentoDto,
} from './dto';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { TituloFinanceiroPresenter } from './presenters/titulo-financeiro.presenter';

describe('FinanceiroController', () => {
  function criarTituloMock(): TituloFinanceiro {
    return TituloFinanceiro.criar({
      negocioId: 'neg-1',
      origem: 'ORCAMENTO',
      origemId: 'orc-10',
      clienteId: 'cli-10',
      descricao: 'Serviço de Detalhamento Automotivo',
      valorOriginal: 600,
      parcelas: [
        {
          numero: 1,
          tipo: 'PARCELA',
          valorOriginal: 300,
          dataVencimento: new Date('2026-09-15'),
        },
        {
          numero: 2,
          tipo: 'PARCELA',
          valorOriginal: 300,
          dataVencimento: new Date('2026-10-15'),
        },
      ],
    });
  }

  function montar() {
    const financeiroService = {
      gerar: jest.fn(),
      buscarPorId: jest.fn(),
      listar: jest.fn(),
      registrarPagamento: jest.fn(),
      cancelar: jest.fn(),
    } as unknown as FinanceiroService;

    const controller = new FinanceiroController(financeiroService);

    return { controller, financeiroService };
  }

  describe('gerar (POST /admin/financeiro/titulos)', () => {
    it('chama FinanceiroService.gerar e retorna presenter com título e parcelas formatadas', async () => {
      const { controller, financeiroService } = montar();
      const tituloMock = criarTituloMock();
      (financeiroService.gerar as jest.Mock).mockResolvedValue(tituloMock);

      const body: GerarTituloReceberDto = {
        negocioId: 'neg-1',
        orcamentoId: 'orc-10',
      };

      const resultado = await controller.gerar(body);

      expect(financeiroService.gerar).toHaveBeenCalledWith(body);
      expect(resultado).toEqual(TituloFinanceiroPresenter.toHTTP(tituloMock));
      expect(resultado.status).toBe('ABERTO');
      expect(resultado.valorTotal).toBe(600);
      expect(resultado.parcelas).toHaveLength(2);
    });
  });

  describe('listar (GET /admin/financeiro/titulos)', () => {
    it('chama FinanceiroService.listar e retorna coleção serializada', async () => {
      const { controller, financeiroService } = montar();
      const tituloMock = criarTituloMock();
      (financeiroService.listar as jest.Mock).mockResolvedValue([tituloMock]);

      const query: ListarTitulosReceberQueryDto = {
        negocioId: 'neg-1',
        status: 'ABERTO',
        pagina: 1,
        limite: 20,
      };

      const resultado = await controller.listar(query);

      expect(financeiroService.listar).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(TituloFinanceiroPresenter.manyToHTTP([tituloMock]));
      expect(resultado).toHaveLength(1);
    });
  });

  describe('buscarPorId (GET /admin/financeiro/titulos/:id)', () => {
    it('chama FinanceiroService.buscarPorId com id e queryNegocioId', async () => {
      const { controller, financeiroService } = montar();
      const tituloMock = criarTituloMock();
      (financeiroService.buscarPorId as jest.Mock).mockResolvedValue(tituloMock);

      const resultado = await controller.buscarPorId(tituloMock.id, 'neg-1');

      expect(financeiroService.buscarPorId).toHaveBeenCalledWith('neg-1', tituloMock.id);
      expect(resultado).toEqual(TituloFinanceiroPresenter.toHTTP(tituloMock));
      expect(resultado.id).toBe(tituloMock.id);
    });
  });

  describe('registrarPagamento (POST /admin/financeiro/titulos/:id/pagamentos)', () => {
    it('chama FinanceiroService.registrarPagamento e retorna título atualizado', async () => {
      const { controller, financeiroService } = montar();
      const tituloMock = criarTituloMock();
      const parcelaId = tituloMock.parcelas[0].id;

      const pagamentoId = tituloMock.registrarPagamento({
        parcelaFinanceiraId: parcelaId,
        valor: 300,
        formaPagamentoId: 'forma-pix',
        formaPagamentoDescricao: 'PIX',
      });
      tituloMock.confirmarPagamento(pagamentoId);

      (financeiroService.registrarPagamento as jest.Mock).mockResolvedValue(tituloMock);

      const body: RegistrarPagamentoDto = {
        negocioId: 'neg-1',
        parcelaId,
        valorPago: 300,
        formaPagamentoId: 'forma-pix',
        formaPagamento: 'PIX',
      };

      const resultado = await controller.registrarPagamento(tituloMock.id, body, undefined);

      expect(financeiroService.registrarPagamento).toHaveBeenCalledWith(
        'neg-1',
        tituloMock.id,
        { ...body, negocioId: 'neg-1' },
      );
      expect(resultado).toEqual(TituloFinanceiroPresenter.toHTTP(tituloMock));
      expect(resultado.valorPago).toBe(300);
      expect(resultado.saldoDevedor).toBe(300);
      expect(resultado.status).toBe('PARCIALMENTE_PAGO');
    });
  });

  describe('cancelar (POST /admin/financeiro/titulos/:id/cancelar)', () => {
    it('chama FinanceiroService.cancelar com motivo e retorna título cancelado', async () => {
      const { controller, financeiroService } = montar();
      const tituloMock = criarTituloMock();
      tituloMock.cancelar('Orçamento cancelado pelo cliente');
      (financeiroService.cancelar as jest.Mock).mockResolvedValue(tituloMock);

      const body: CancelarTituloReceberDto = {
        negocioId: 'neg-1',
        motivo: 'Orçamento cancelado pelo cliente',
      };

      const resultado = await controller.cancelar(tituloMock.id, body, undefined);

      expect(financeiroService.cancelar).toHaveBeenCalledWith(
        'neg-1',
        tituloMock.id,
        'Orçamento cancelado pelo cliente',
      );
      expect(resultado).toEqual(TituloFinanceiroPresenter.toHTTP(tituloMock));
      expect(resultado.status).toBe('CANCELADO');
      expect(resultado.motivoCancelamento).toBe('Orçamento cancelado pelo cliente');
    });
  });
});
