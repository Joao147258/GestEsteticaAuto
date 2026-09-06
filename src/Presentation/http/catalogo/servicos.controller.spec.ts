import { ConsumoInsumoServico, Servico } from '../../../Domain';
import { AdicionarConsumoInsumoServicoDto } from './dto/adicionar-consumo-insumo-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { ListarServicosQueryDto } from './dto/listar-servicos-query.dto';
import { ConsumoInsumoServicoPresenter, ServicoPresenter } from './presenters/servico.presenter';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';

describe('ServicosController', () => {
  function montar() {
    const servicosService = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      inativar: jest.fn(),
      ativar: jest.fn(),
      adicionarConsumo: jest.fn(),
      listarConsumos: jest.fn(),
      removerConsumo: jest.fn(),
    } as unknown as ServicosService;

    const controller = new ServicosController(servicosService);

    return { controller, servicosService };
  }

  function criarServico(): Servico {
    return Servico.criar({
      negocioId: 'neg-1',
      nome: 'Lavagem Detalhada',
      precoBase: 120,
      descricao: 'Lavagem completa com proteção',
      duracaoEstimadaMinutos: 90,
      observacoes: 'Usar shampoo neutro',
    });
  }

  function criarConsumo(): ConsumoInsumoServico {
    return ConsumoInsumoServico.criar({
      negocioId: 'neg-1',
      servicoId: 'serv-1',
      produtoId: 'prod-shampoo',
      quantidade: 50,
      unidadeMedida: 'ML',
    });
  }

  describe('criar (POST /admin/servicos)', () => {
    it('chama ServicosService.criar com o DTO e devolve o presenter do serviço', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.criar as jest.Mock).mockResolvedValue(servico);

      const dto: CriarServicoDto = {
        negocioId: 'neg-1',
        nome: 'Lavagem Detalhada',
        precoBase: 120,
        descricao: 'Lavagem completa com proteção',
        duracaoEstimadaMinutos: 90,
        observacoes: 'Usar shampoo neutro',
      };

      const resultado = await controller.criar(dto);

      expect(servicosService.criar).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(ServicoPresenter.toHTTP(servico));
    });
  });

  describe('listar (GET /admin/servicos)', () => {
    it('chama ServicosService.listar com a query e devolve presenter em lote', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.listar as jest.Mock).mockResolvedValue([servico]);

      const query: ListarServicosQueryDto = {
        negocioId: 'neg-1',
        busca: 'Lavagem',
        pagina: 1,
        limite: 10,
        ativo: true,
      };

      const resultado = await controller.listar(query);

      expect(servicosService.listar).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(ServicoPresenter.manyToHTTP([servico]));
    });
  });

  describe('buscarPorId (GET /admin/servicos/:id)', () => {
    it('chama ServicosService.buscarPorId com id e negocioId e devolve o presenter', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.buscarPorId as jest.Mock).mockResolvedValue(servico);

      const resultado = await controller.buscarPorId(servico.id, 'neg-1');

      expect(servicosService.buscarPorId).toHaveBeenCalledWith('neg-1', servico.id);
      expect(resultado).toEqual(ServicoPresenter.toHTTP(servico));
    });
  });

  describe('atualizar (PATCH /admin/servicos/:id)', () => {
    it('chama ServicosService.atualizar com o DTO e devolve o presenter atualizado', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.atualizar as jest.Mock).mockResolvedValue(servico);

      const dto: AtualizarServicoDto = {
        negocioId: 'neg-1',
        precoBase: 150,
      };

      const resultado = await controller.atualizar(servico.id, dto);

      expect(servicosService.atualizar).toHaveBeenCalledWith(servico.id, dto);
      expect(resultado).toEqual(ServicoPresenter.toHTTP(servico));
    });
  });

  describe('inativar (DELETE /admin/servicos/:id)', () => {
    it('chama ServicosService.inativar com id e negocioId', async () => {
      const { controller, servicosService } = montar();
      (servicosService.inativar as jest.Mock).mockResolvedValue(undefined);

      await controller.inativar('serv-1', 'neg-1');

      expect(servicosService.inativar).toHaveBeenCalledWith('neg-1', 'serv-1');
    });
  });

  describe('ativar (POST /admin/servicos/:id/ativar)', () => {
    it('chama ServicosService.ativar com id e negocioId via query e devolve o presenter', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.ativar as jest.Mock).mockResolvedValue(servico);

      const resultado = await controller.ativar('serv-1', 'neg-1', undefined);

      expect(servicosService.ativar).toHaveBeenCalledWith('neg-1', 'serv-1');
      expect(resultado).toEqual(ServicoPresenter.toHTTP(servico));
    });

    it('chama ServicosService.ativar com id e negocioId via body e devolve o presenter', async () => {
      const { controller, servicosService } = montar();
      const servico = criarServico();
      (servicosService.ativar as jest.Mock).mockResolvedValue(servico);

      const resultado = await controller.ativar('serv-1', undefined, 'neg-1');

      expect(servicosService.ativar).toHaveBeenCalledWith('neg-1', 'serv-1');
      expect(resultado).toEqual(ServicoPresenter.toHTTP(servico));
    });
  });

  describe('adicionarConsumo (POST /admin/servicos/:id/consumos)', () => {
    it('chama ServicosService.adicionarConsumo com servicoId e DTO e devolve o presenter', async () => {
      const { controller, servicosService } = montar();
      const consumo = criarConsumo();
      (servicosService.adicionarConsumo as jest.Mock).mockResolvedValue(consumo);

      const dto: AdicionarConsumoInsumoServicoDto = {
        negocioId: 'neg-1',
        produtoId: 'prod-shampoo',
        quantidade: 50,
        unidadeMedida: 'ML',
      };

      const resultado = await controller.adicionarConsumo('serv-1', dto);

      expect(servicosService.adicionarConsumo).toHaveBeenCalledWith('serv-1', dto);
      expect(resultado).toEqual(ConsumoInsumoServicoPresenter.toHTTP(consumo));
    });
  });

  describe('listarConsumos (GET /admin/servicos/:id/consumos)', () => {
    it('chama ServicosService.listarConsumos e devolve lista de consumos via presenter', async () => {
      const { controller, servicosService } = montar();
      const consumo = criarConsumo();
      (servicosService.listarConsumos as jest.Mock).mockResolvedValue([consumo]);

      const resultado = await controller.listarConsumos('serv-1', 'neg-1');

      expect(servicosService.listarConsumos).toHaveBeenCalledWith('neg-1', 'serv-1');
      expect(resultado).toEqual(ConsumoInsumoServicoPresenter.manyToHTTP([consumo]));
    });
  });

  describe('removerConsumo (DELETE /admin/servicos/:id/consumos/:consumoId)', () => {
    it('chama ServicosService.removerConsumo com negocioId e consumoId', async () => {
      const { controller, servicosService } = montar();
      (servicosService.removerConsumo as jest.Mock).mockResolvedValue(undefined);

      await controller.removerConsumo('serv-1', 'consumo-1', 'neg-1');

      expect(servicosService.removerConsumo).toHaveBeenCalledWith('neg-1', 'consumo-1');
    });
  });
});
