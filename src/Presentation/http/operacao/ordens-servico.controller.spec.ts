import { OrdemServico } from '../../../Domain';
import {
  ResultadoConfirmacaoConsumoItemOS,
  SugestaoConsumoInsumoItem,
} from '../../../Application/operacao';
import {
  AtualizarOrdemServicoDto,
  CancelarOrdemServicoDto,
  ConcluirOrdemServicoDto,
  ConfirmarConsumoItemOsDto,
  ConsultarConsumoPrevistoQueryDto,
  GerarOrdemServicoDto,
  ListarOrdensServicoQueryDto,
  PausarOrdemServicoDto,
  TransicaoStatusOsDto,
} from './dto';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';
import { ConsumoInsumosItemOsPresenter } from './presenters/consumo-insumos-item-os.presenter';
import { OrdemServicoPresenter } from './presenters/ordem-servico.presenter';

// Testes unitários do OrdensServicoController para o ciclo de vida da OS e consumo de insumos.
describe('OrdensServicoController', () => {
  function criarOrdemServicoMock(): OrdemServico {
    const os = OrdemServico.criar({
      negocioId: 'neg-1',
      clienteId: 'cli-1',
      veiculoId: 'vei-1',
      orcamentoId: 'orc-1',
      observacoes: 'Obs teste',
    });
    os.adicionarItem({
      descricao: 'Polimento Técnico',
      servicoId: 'serv-1',
    });
    return os;
  }

  function montar() {
    const ordensServicoService = {
      gerar: jest.fn(),
      buscarPorId: jest.fn(),
      listar: jest.fn(),
      atualizar: jest.fn(),
      iniciar: jest.fn(),
      pausar: jest.fn(),
      concluir: jest.fn(),
      entregar: jest.fn(),
      cancelar: jest.fn(),
      calcularConsumoPrevisto: jest.fn(),
      confirmarConsumo: jest.fn(),
    } as unknown as OrdensServicoService;

    const controller = new OrdensServicoController(ordensServicoService);

    return { controller, ordensServicoService };
  }

  describe('gerar (POST /admin/ordens-servico)', () => {
    it('chama OrdensServicoService.gerar com body e retorna presenter formatado', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      (ordensServicoService.gerar as jest.Mock).mockResolvedValue(osMock);

      const body: GerarOrdemServicoDto = {
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
      };

      const resultado = await controller.gerar(body);

      expect(ordensServicoService.gerar).toHaveBeenCalledWith('neg-1', 'orc-1');
      expect(resultado).toEqual(OrdemServicoPresenter.toHTTP(osMock));
      expect(resultado.status).toBe('ABERTA');
      expect(resultado.itens).toHaveLength(1);
    });
  });

  describe('listar (GET /admin/ordens-servico)', () => {
    it('chama OrdensServicoService.listar com os filtros da query e retorna lista serializada', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      (ordensServicoService.listar as jest.Mock).mockResolvedValue([osMock]);

      const query: ListarOrdensServicoQueryDto = {
        negocioId: 'neg-1',
        status: 'ABERTA',
        pagina: 1,
        limite: 10,
      };

      const resultado = await controller.listar(query);

      expect(ordensServicoService.listar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        status: 'ABERTA',
        clienteId: undefined,
        veiculoId: undefined,
        orcamentoId: undefined,
        busca: undefined,
        pagina: 1,
        limite: 10,
        dataInicio: undefined,
        dataFim: undefined,
      });
      expect(resultado).toEqual(OrdemServicoPresenter.manyToHTTP([osMock]));
      expect(resultado).toHaveLength(1);
    });
  });

  describe('buscarPorId (GET /admin/ordens-servico/:id)', () => {
    it('chama OrdensServicoService.buscarPorId com id e queryNegocioId', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      (ordensServicoService.buscarPorId as jest.Mock).mockResolvedValue(osMock);

      const resultado = await controller.buscarPorId(osMock.id, 'neg-1');

      expect(ordensServicoService.buscarPorId).toHaveBeenCalledWith('neg-1', osMock.id);
      expect(resultado).toEqual(OrdemServicoPresenter.toHTTP(osMock));
    });
  });

  describe('atualizar (PATCH /admin/ordens-servico/:id)', () => {
    it('chama OrdensServicoService.atualizar com body e retorna presenter', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      (ordensServicoService.atualizar as jest.Mock).mockResolvedValue(osMock);

      const body: AtualizarOrdemServicoDto = {
        negocioId: 'neg-1',
        observacoes: 'Novas observações',
        previsaoInicio: '2026-09-07T08:00:00.000Z',
        previsaoConclusao: '2026-09-08T18:00:00.000Z',
      };

      const resultado = await controller.atualizar(osMock.id, body);

      expect(ordensServicoService.atualizar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        ordemServicoId: osMock.id,
        observacoes: 'Novas observações',
        previsaoInicio: new Date('2026-09-07T08:00:00.000Z'),
        previsaoConclusao: new Date('2026-09-08T18:00:00.000Z'),
      });
      expect(resultado).toEqual(OrdemServicoPresenter.toHTTP(osMock));
    });
  });

  describe('iniciar (POST /admin/ordens-servico/:id/iniciar)', () => {
    it('chama OrdensServicoService.iniciar e retorna OS em execução', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      osMock.iniciar();
      (ordensServicoService.iniciar as jest.Mock).mockResolvedValue(osMock);

      const body: TransicaoStatusOsDto = { negocioId: 'neg-1' };
      const resultado = await controller.iniciar(osMock.id, body);

      expect(ordensServicoService.iniciar).toHaveBeenCalledWith('neg-1', osMock.id);
      expect(resultado.status).toBe('EM_EXECUCAO');
    });
  });

  describe('pausar (POST /admin/ordens-servico/:id/pausar)', () => {
    it('chama OrdensServicoService.pausar com motivo opcional', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      osMock.iniciar();
      osMock.pausar();
      (ordensServicoService.pausar as jest.Mock).mockResolvedValue(osMock);

      const body: PausarOrdemServicoDto = {
        negocioId: 'neg-1',
        motivo: 'Aguardando secagem da peça',
      };
      const resultado = await controller.pausar(osMock.id, body);

      expect(ordensServicoService.pausar).toHaveBeenCalledWith(
        'neg-1',
        osMock.id,
        'Aguardando secagem da peça',
      );
      expect(resultado.status).toBe('PAUSADA');
    });
  });

  describe('concluir (POST /admin/ordens-servico/:id/concluir)', () => {
    it('chama OrdensServicoService.concluir com observação opcional', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      osMock.iniciar();
      osMock.concluirItem(osMock.itens[0].id);
      osMock.concluir();
      (ordensServicoService.concluir as jest.Mock).mockResolvedValue(osMock);

      const body: ConcluirOrdemServicoDto = {
        negocioId: 'neg-1',
        observacaoConclusao: 'Serviço finalizado com excelência',
      };
      const resultado = await controller.concluir(osMock.id, body);

      expect(ordensServicoService.concluir).toHaveBeenCalledWith(
        'neg-1',
        osMock.id,
        'Serviço finalizado com excelência',
      );
      expect(resultado.status).toBe('CONCLUIDA');
    });
  });

  describe('entregar (POST /admin/ordens-servico/:id/entregar)', () => {
    it('chama OrdensServicoService.entregar e transiciona para ENTREGUE', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      osMock.iniciar();
      osMock.concluirItem(osMock.itens[0].id);
      osMock.concluir();
      osMock.entregar();
      (ordensServicoService.entregar as jest.Mock).mockResolvedValue(osMock);

      const body: TransicaoStatusOsDto = { negocioId: 'neg-1' };
      const resultado = await controller.entregar(osMock.id, body);

      expect(ordensServicoService.entregar).toHaveBeenCalledWith('neg-1', osMock.id);
      expect(resultado.status).toBe('ENTREGUE');
    });
  });

  describe('cancelar (POST /admin/ordens-servico/:id/cancelar)', () => {
    it('chama OrdensServicoService.cancelar com motivo obrigatório', async () => {
      const { controller, ordensServicoService } = montar();
      const osMock = criarOrdemServicoMock();
      osMock.cancelar({ descricao: 'Cliente desistiu do serviço' });
      (ordensServicoService.cancelar as jest.Mock).mockResolvedValue(osMock);

      const body: CancelarOrdemServicoDto = {
        negocioId: 'neg-1',
        motivo: 'Cliente desistiu do serviço',
      };
      const resultado = await controller.cancelar(osMock.id, body);

      expect(ordensServicoService.cancelar).toHaveBeenCalledWith(
        'neg-1',
        osMock.id,
        'Cliente desistiu do serviço',
      );
      expect(resultado.status).toBe('CANCELADA');
    });
  });

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
      expect(resultado.custoEstimado).toBe(2.35);
    });
  });
});
