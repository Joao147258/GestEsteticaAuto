import { Veiculo } from '../../../Domain';
import { NotFoundError } from '../../../Shared/errors/not-found.error';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { ListarVeiculosQueryDto } from './dto/listar-veiculos-query.dto';
import { VeiculoPresenter } from './presenters/veiculo.presenter';

describe('VeiculosController', () => {
  function montar() {
    const veiculosService = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    } as unknown as VeiculosService;

    const controller = new VeiculosController(veiculosService);

    return { controller, veiculosService };
  }

  function criarVeiculo(): Veiculo {
    return Veiculo.criar({
      negocioId: 'neg-1',
      clienteId: 'cli-1',
      placa: 'ABC1234',
      marca: 'Toyota',
      modelo: 'Corolla',
      anoFabricacao: 2020,
      anoModelo: 2021,
      cor: 'Prata',
      quilometragem: 45000,
    });
  }

  function criarDto(): CriarVeiculoDto {
    const dto = new CriarVeiculoDto();
    dto.negocioId = 'neg-1';
    dto.clienteId = 'cli-1';
    dto.placa = 'ABC1234';
    dto.marca = 'Toyota';
    dto.modelo = 'Corolla';
    dto.anoFabricacao = 2020;
    dto.anoModelo = 2021;
    dto.cor = 'Prata';
    dto.quilometragem = 45000;
    return dto;
  }

  describe('criar (POST /admin/veiculos)', () => {
    it('chama VeiculosService.criar com o DTO e devolve o presenter do veiculo', async () => {
      const { controller, veiculosService } = montar();
      const veiculo = criarVeiculo();
      veiculosService.criar = jest.fn().mockResolvedValue(veiculo);

      const resultado = await controller.criar(criarDto());

      expect(veiculosService.criar).toHaveBeenCalledWith(criarDto());
      expect(resultado).toEqual(VeiculoPresenter.toHTTP(veiculo));
    });
  });

  describe('listar (GET /admin/veiculos)', () => {
    it('chama VeiculosService.listar com a query e devolve a lista via presenter', async () => {
      const { controller, veiculosService } = montar();
      const query = new ListarVeiculosQueryDto();
      query.negocioId = 'neg-1';
      query.busca = 'corolla';
      query.pagina = 1;
      query.limite = 10;
      const veiculos = [criarVeiculo()];
      veiculosService.listar = jest.fn().mockResolvedValue(veiculos);

      const resultado = await controller.listar(query);

      expect(veiculosService.listar).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(VeiculoPresenter.manyToHTTP(veiculos));
    });
  });

  describe('buscarPorId (GET /admin/veiculos/:id)', () => {
    it('chama VeiculosService.buscarPorId com params e devolve presenter', async () => {
      const { controller, veiculosService } = montar();
      const veiculo = criarVeiculo();
      veiculosService.buscarPorId = jest.fn().mockResolvedValue(veiculo);

      const resultado = await controller.buscarPorId(veiculo.id, 'neg-1');

      expect(veiculosService.buscarPorId).toHaveBeenCalledWith('neg-1', veiculo.id);
      expect(resultado).toEqual(VeiculoPresenter.toHTTP(veiculo));
    });

    it('propaga NotFoundError quando veiculo nao encontrado', async () => {
      const { controller, veiculosService } = montar();
      veiculosService.buscarPorId = jest
        .fn()
        .mockRejectedValue(new NotFoundError('Veículo não encontrado.'));

      await expect(controller.buscarPorId('vei-inexistente', 'neg-1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('atualizar (PATCH /admin/veiculos/:id)', () => {
    it('chama VeiculosService.atualizar com id e DTO e devolve o veiculo atualizado', async () => {
      const { controller, veiculosService } = montar();
      const veiculo = criarVeiculo();
      veiculosService.atualizar = jest.fn().mockResolvedValue(veiculo);

      const dto = new AtualizarVeiculoDto();
      dto.negocioId = 'neg-1';
      dto.cor = 'Preto';
      dto.quilometragem = 50000;

      const resultado = await controller.atualizar(veiculo.id, dto);

      expect(veiculosService.atualizar).toHaveBeenCalledWith(veiculo.id, dto);
      expect(resultado).toEqual(VeiculoPresenter.toHTTP(veiculo));
    });
  });

  describe('remover (DELETE /admin/veiculos/:id)', () => {
    it('chama VeiculosService.remover com negocioId e veiculoId', async () => {
      const { controller, veiculosService } = montar();
      veiculosService.remover = jest.fn().mockResolvedValue(undefined);

      await controller.remover('vei-1', 'neg-1');

      expect(veiculosService.remover).toHaveBeenCalledWith('neg-1', 'vei-1');
    });
  });
});
