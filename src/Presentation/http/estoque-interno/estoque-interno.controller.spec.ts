import { EstoqueInterno, MovimentacaoEstoqueInternoProps } from '../../../Domain';
import { AjustarQuantidadeEstoqueInternoDto } from './dto/ajustar-quantidade-estoque-interno.dto';
import { CriarItemEstoqueInternoDto } from './dto/criar-item-estoque-interno.dto';
import { ListarMovimentacoesEstoqueInternoQueryDto } from './dto/listar-movimentacoes-estoque-interno-query.dto';
import { RegistrarEntradaEstoqueInternoDto } from './dto/registrar-entrada-estoque-interno.dto';
import { RegistrarPerdaEstoqueInternoDto } from './dto/registrar-perda-estoque-interno.dto';
import { RegistrarSaidaInternaEstoqueInternoDto } from './dto/registrar-saida-interna-estoque-interno.dto';
import { EstoqueInternoController } from './estoque-interno.controller';
import { EstoqueInternoService } from './estoque-interno.service';
import { EstoqueInternoPresenter } from './presenters/estoque-interno.presenter';

// Testes unitários do EstoqueInternoController — camada HTTP da gestão de insumos.
// Valida o repasse fiel de parâmetros para o EstoqueInternoService e a formatação via Presenter.
describe('EstoqueInternoController', () => {
  function montar() {
    const estoqueInternoService = {
      criarItem: jest.fn(),
      consultarSaldo: jest.fn(),
      registrarEntrada: jest.fn(),
      registrarSaidaInterna: jest.fn(),
      registrarPerda: jest.fn(),
      ajustarQuantidade: jest.fn(),
      listarMovimentacoes: jest.fn(),
    } as unknown as EstoqueInternoService;

    const controller = new EstoqueInternoController(estoqueInternoService);

    return { controller, estoqueInternoService };
  }

  function criarEstoque(): EstoqueInterno {
    return EstoqueInterno.criar({
      negocioId: 'neg-1',
      produtoId: 'prod-insumo-1',
      unidadeMedida: 'UNIDADE',
      quantidadeInicial: 20,
      estoqueMinimo: 5,
      custoUnitarioAproximado: 15.5,
      observacoes: 'Insumo de polimento',
    });
  }

  function criarMovimentacao(): MovimentacaoEstoqueInternoProps {
    return {
      id: 'mov-1',
      negocioId: 'neg-1',
      estoqueInternoId: 'est-1',
      produtoId: 'prod-insumo-1',
      tipo: 'ENTRADA',
      quantidade: 20,
      unidadeMedida: 'UNIDADE',
      quantidadeAnterior: 0,
      quantidadeNova: 20,
      motivo: 'Carga inicial',
      observacoes: null,
      referenciaId: null,
      referenciaTipo: null,
      referenciaItemId: null,
      registradoEm: new Date('2026-09-06T15:00:00Z'),
    };
  }

  describe('criarItem (POST /admin/estoque-interno)', () => {
    it('chama EstoqueInternoService.criarItem com o DTO e devolve o presenter formatado', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.criarItem as jest.Mock).mockResolvedValue(estoque);

      const dto: CriarItemEstoqueInternoDto = {
        negocioId: 'neg-1',
        produtoId: 'prod-insumo-1',
        unidadeMedida: 'UNIDADE',
        quantidadeAtual: 20,
        estoqueMinimo: 5,
        custoUnitarioAproximado: 15.5,
        observacoes: 'Insumo de polimento',
      };

      const resultado = await controller.criarItem(dto);

      expect(estoqueInternoService.criarItem).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('consultarSaldo (GET /admin/estoque-interno/:produtoId/saldo)', () => {
    it('chama EstoqueInternoService.consultarSaldo com negocioId e produtoId e devolve o presenter', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.consultarSaldo as jest.Mock).mockResolvedValue(estoque);

      const resultado = await controller.consultarSaldo('prod-insumo-1', 'neg-1');

      expect(estoqueInternoService.consultarSaldo).toHaveBeenCalledWith('neg-1', 'prod-insumo-1');
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('registrarEntrada (POST /admin/estoque-interno/:produtoId/entradas)', () => {
    it('chama EstoqueInternoService.registrarEntrada com produtoId e DTO e devolve o saldo atualizado', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.registrarEntrada as jest.Mock).mockResolvedValue(estoque);

      const dto: RegistrarEntradaEstoqueInternoDto = {
        negocioId: 'neg-1',
        quantidade: 10,
        motivo: 'Compra fornecedor ABC',
      };

      const resultado = await controller.registrarEntrada('prod-insumo-1', dto);

      expect(estoqueInternoService.registrarEntrada).toHaveBeenCalledWith('prod-insumo-1', dto);
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('registrarSaidaInterna (POST /admin/estoque-interno/:produtoId/saidas)', () => {
    it('chama EstoqueInternoService.registrarSaidaInterna com produtoId e DTO e devolve o saldo atualizado', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.registrarSaidaInterna as jest.Mock).mockResolvedValue(estoque);

      const dto: RegistrarSaidaInternaEstoqueInternoDto = {
        negocioId: 'neg-1',
        quantidade: 2,
        motivo: 'Consumo na OS 100',
        referenciaId: 'os-100',
        referenciaTipo: 'ORDEM_SERVICO',
      };

      const resultado = await controller.registrarSaidaInterna('prod-insumo-1', dto);

      expect(estoqueInternoService.registrarSaidaInterna).toHaveBeenCalledWith('prod-insumo-1', dto);
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('registrarPerda (POST /admin/estoque-interno/:produtoId/perdas)', () => {
    it('chama EstoqueInternoService.registrarPerda com produtoId e DTO e devolve o saldo atualizado', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.registrarPerda as jest.Mock).mockResolvedValue(estoque);

      const dto: RegistrarPerdaEstoqueInternoDto = {
        negocioId: 'neg-1',
        quantidade: 1,
        motivo: 'Frasco quebrado durante manuseio',
      };

      const resultado = await controller.registrarPerda('prod-insumo-1', dto);

      expect(estoqueInternoService.registrarPerda).toHaveBeenCalledWith('prod-insumo-1', dto);
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('ajustarQuantidade (POST /admin/estoque-interno/:produtoId/ajustes)', () => {
    it('chama EstoqueInternoService.ajustarQuantidade com produtoId e DTO e devolve o saldo ajustado', async () => {
      const { controller, estoqueInternoService } = montar();
      const estoque = criarEstoque();
      (estoqueInternoService.ajustarQuantidade as jest.Mock).mockResolvedValue(estoque);

      const dto: AjustarQuantidadeEstoqueInternoDto = {
        negocioId: 'neg-1',
        novaQuantidade: 25,
        motivo: 'Inventário mensal de contagem física',
      };

      const resultado = await controller.ajustarQuantidade('prod-insumo-1', dto);

      expect(estoqueInternoService.ajustarQuantidade).toHaveBeenCalledWith('prod-insumo-1', dto);
      expect(resultado).toEqual(EstoqueInternoPresenter.toHTTP(estoque));
    });
  });

  describe('listarMovimentacoes (GET /admin/estoque-interno/:produtoId/movimentacoes)', () => {
    it('chama EstoqueInternoService.listarMovimentacoes com produtoId e query e devolve lista formatada', async () => {
      const { controller, estoqueInternoService } = montar();
      const movimentacao = criarMovimentacao();
      (estoqueInternoService.listarMovimentacoes as jest.Mock).mockResolvedValue([movimentacao]);

      const query: ListarMovimentacoesEstoqueInternoQueryDto = {
        negocioId: 'neg-1',
      };

      const resultado = await controller.listarMovimentacoes('prod-insumo-1', query);

      expect(estoqueInternoService.listarMovimentacoes).toHaveBeenCalledWith('prod-insumo-1', query);
      expect(resultado).toEqual(EstoqueInternoPresenter.movimentacoesToHTTP([movimentacao]));
    });
  });
});
