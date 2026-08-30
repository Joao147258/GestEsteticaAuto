import {
  AbrirOrcamentoUseCase,
  AdicionarItemOrcamentoUseCase,
  AprovarOrcamentoUseCase,
  AtualizarObservacoesOrcamentoUseCase,
  BuscarOrcamentoPorIdUseCase,
  CancelarOrcamentoUseCase,
  CriarOrcamentoUseCase,
  ListarOrcamentosUseCase,
  OrcamentoOutputDTO,
  RecusarOrcamentoUseCase,
  RemoverItemOrcamentoUseCase,
} from '../../../Application/comercial';
import { AbrirOrcamentoDto } from './dto/abrir-orcamento.dto';
import { AdicionarItemOrcamentoDto } from './dto/adicionar-item-orcamento.dto';
import { AprovarOrcamentoDto } from './dto/aprovar-orcamento.dto';
import { AtualizarObservacoesOrcamentoDto } from './dto/atualizar-observacoes-orcamento.dto';
import { CancelarOrcamentoDto } from './dto/cancelar-orcamento.dto';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { ListarOrcamentosQueryDto } from './dto/listar-orcamentos-query.dto';
import { RecusarOrcamentoDto } from './dto/recusar-orcamento.dto';
import { RemoverItemOrcamentoDto } from './dto/remover-item-orcamento.dto';
import { OrcamentosController } from './orcamentos.controller';

describe('OrcamentosController', () => {
  function montar() {
    const executar = jest.fn();

    const criarOrcamentoUseCase = {
      executar,
    } as unknown as CriarOrcamentoUseCase;
    const listarOrcamentosUseCase = {
      executar,
    } as unknown as ListarOrcamentosUseCase;
    const buscarOrcamentoPorIdUseCase = {
      executar,
    } as unknown as BuscarOrcamentoPorIdUseCase;
    const abrirOrcamentoUseCase = {
      executar,
    } as unknown as AbrirOrcamentoUseCase;
    const adicionarItemOrcamentoUseCase = {
      executar,
    } as unknown as AdicionarItemOrcamentoUseCase;
    const removerItemOrcamentoUseCase = {
      executar,
    } as unknown as RemoverItemOrcamentoUseCase;
    const atualizarObservacoesOrcamentoUseCase = {
      executar,
    } as unknown as AtualizarObservacoesOrcamentoUseCase;
    const aprovarOrcamentoUseCase = {
      executar,
    } as unknown as AprovarOrcamentoUseCase;
    const recusarOrcamentoUseCase = {
      executar,
    } as unknown as RecusarOrcamentoUseCase;
    const cancelarOrcamentoUseCase = {
      executar,
    } as unknown as CancelarOrcamentoUseCase;

    const controller = new OrcamentosController(
      criarOrcamentoUseCase,
      listarOrcamentosUseCase,
      buscarOrcamentoPorIdUseCase,
      abrirOrcamentoUseCase,
      adicionarItemOrcamentoUseCase,
      removerItemOrcamentoUseCase,
      atualizarObservacoesOrcamentoUseCase,
      aprovarOrcamentoUseCase,
      recusarOrcamentoUseCase,
      cancelarOrcamentoUseCase,
    );

    return {
      controller,
      executar,
      useCases: {
        criarOrcamentoUseCase,
        listarOrcamentosUseCase,
        buscarOrcamentoPorIdUseCase,
        abrirOrcamentoUseCase,
        adicionarItemOrcamentoUseCase,
        removerItemOrcamentoUseCase,
        atualizarObservacoesOrcamentoUseCase,
        aprovarOrcamentoUseCase,
        recusarOrcamentoUseCase,
        cancelarOrcamentoUseCase,
      },
    };
  }

  function criarDto(): CriarOrcamentoDto {
    const dto = new CriarOrcamentoDto();
    dto.negocioId = 'neg-1';
    dto.clienteId = 'cli-1';
    dto.veiculoId = 'vei-1';
    dto.observacoes = 'cliente pediu desconto';
    dto.itens = [{ servicoId: 'serv-1', quantidade: 1, valorUnitario: 120 }];
    return dto;
  }

  function criarOutput(): OrcamentoOutputDTO {
    return {
      id: 'orc-1',
      negocioId: 'neg-1',
      clienteId: 'cli-1',
      veiculoId: 'vei-1',
      origem: 'PAINEL',
      status: 'RASCUNHO',
      itens: [],
      valorTotal: 120,
      criadoEm: new Date('2026-01-01T10:00:00Z'),
    };
  }

  describe('criar (POST /admin/orcamentos)', () => {
    it('chama CriarOrcamentoUseCase com os dados do DTO e retorna o resultado', async () => {
      const { controller, executar, useCases } = montar();
      const output = criarOutput();
      executar.mockResolvedValue(output);

      const resultado = await controller.criar(criarDto());

      expect(useCases.criarOrcamentoUseCase.executar).toHaveBeenCalledWith(
        expect.objectContaining({
          negocioId: 'neg-1',
          clienteId: 'cli-1',
          veiculoId: 'vei-1',
          observacoes: 'cliente pediu desconto',
          itens: [{ servicoId: 'serv-1', quantidade: 1, valorUnitario: 120 }],
          origem: 'PAINEL',
        }),
      );
      expect(resultado).toBe(output);
    });

    it('força origem PAINEL na rota administrativa', async () => {
      const { controller, executar, useCases } = montar();
      executar.mockResolvedValue(criarOutput());

      await controller.criar(criarDto());

      expect(useCases.criarOrcamentoUseCase.executar).toHaveBeenCalledWith(
        expect.objectContaining({ origem: 'PAINEL' }),
      );
    });

    it('o DTO HTTP não expõe origem (rota admin não aceita SITE)', () => {
      const dto = new CriarOrcamentoDto();
      expect(dto).not.toHaveProperty('origem');
    });

    it('não acessa Prisma diretamente — depende apenas dos use cases', () => {
      const { controller } = montar();
      const dependencias = controller as unknown as Record<string, unknown>;

      expect(dependencias).not.toHaveProperty('prisma');
      expect(dependencias).not.toHaveProperty('prismaService');
    });

    it('não contém regra de negócio — propaga o erro do use case', async () => {
      const { controller, executar } = montar();
      executar.mockRejectedValue(new Error('erro de domínio'));

      await expect(controller.criar(criarDto())).rejects.toThrow(
        'erro de domínio',
      );
    });
  });

  describe('listar (GET /admin/orcamentos)', () => {
    it('chama ListarOrcamentosUseCase com os filtros da query', async () => {
      const { controller, useCases } = montar();
      const query = new ListarOrcamentosQueryDto();
      query.negocioId = 'neg-1';
      query.status = 'EM_ABERTO';
      query.busca = 'polimento';
      query.pagina = 1;
      query.limite = 10;
      const output = [criarOutput()];
      useCases.listarOrcamentosUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);

      const resultado = await controller.listar(query);

      expect(useCases.listarOrcamentosUseCase.executar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        status: 'EM_ABERTO',
        busca: 'polimento',
        pagina: 1,
        limite: 10,
      });
      expect(resultado).toBe(output);
    });
  });

  describe('buscarPorId (GET /admin/orcamentos/:id)', () => {
    it('chama BuscarOrcamentoPorIdUseCase com negocioId da query e id do path', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.buscarOrcamentoPorIdUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);

      const resultado = await controller.buscarPorId('orc-1', 'neg-1');

      expect(
        useCases.buscarOrcamentoPorIdUseCase.executar,
      ).toHaveBeenCalledWith({ negocioId: 'neg-1', orcamentoId: 'orc-1' });
      expect(resultado).toBe(output);
    });
  });

  describe('abrir (POST /admin/orcamentos/:id/abrir)', () => {
    it('chama AbrirOrcamentoUseCase com negocioId do body e id do path', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.abrirOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new AbrirOrcamentoDto();
      dto.negocioId = 'neg-1';

      const resultado = await controller.abrir('orc-1', dto);

      expect(useCases.abrirOrcamentoUseCase.executar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
      });
      expect(resultado).toBe(output);
    });
  });

  describe('adicionarItem (POST /admin/orcamentos/:id/itens)', () => {
    it('chama AdicionarItemOrcamentoUseCase com os dados do item', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.adicionarItemOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new AdicionarItemOrcamentoDto();
      dto.negocioId = 'neg-1';
      dto.servicoId = 'serv-1';
      dto.quantidade = 2;
      dto.valorUnitario = 100;
      dto.observacao = 'com cristalização';

      const resultado = await controller.adicionarItem('orc-1', dto);

      expect(
        useCases.adicionarItemOrcamentoUseCase.executar,
      ).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
        servicoId: 'serv-1',
        quantidade: 2,
        valorUnitario: 100,
        observacao: 'com cristalização',
      });
      expect(resultado).toBe(output);
    });
  });

  describe('removerItem (DELETE /admin/orcamentos/:id/itens/:itemId)', () => {
    it('chama RemoverItemOrcamentoUseCase com ids do path e negocioId do body', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.removerItemOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new RemoverItemOrcamentoDto();
      dto.negocioId = 'neg-1';

      const resultado = await controller.removerItem('orc-1', 'item-9', dto);

      expect(useCases.removerItemOrcamentoUseCase.executar).toHaveBeenCalledWith(
        { negocioId: 'neg-1', orcamentoId: 'orc-1', itemId: 'item-9' },
      );
      expect(resultado).toBe(output);
    });
  });

  describe('atualizarObservacoes (PATCH /admin/orcamentos/:id/observacoes)', () => {
    it('chama AtualizarObservacoesOrcamentoUseCase com as observações', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.atualizarObservacoesOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new AtualizarObservacoesOrcamentoDto();
      dto.negocioId = 'neg-1';
      dto.observacoes = 'cliente pediu desconto';

      const resultado = await controller.atualizarObservacoes('orc-1', dto);

      expect(
        useCases.atualizarObservacoesOrcamentoUseCase.executar,
      ).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
        observacoes: 'cliente pediu desconto',
      });
      expect(resultado).toBe(output);
    });
  });

  describe('aprovar (POST /admin/orcamentos/:id/aprovar)', () => {
    it('chama AprovarOrcamentoUseCase com negocioId do body e id do path', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.aprovarOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new AprovarOrcamentoDto();
      dto.negocioId = 'neg-1';

      const resultado = await controller.aprovar('orc-1', dto);

      expect(useCases.aprovarOrcamentoUseCase.executar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
      });
      expect(resultado).toBe(output);
    });
  });

  describe('recusar (POST /admin/orcamentos/:id/recusar)', () => {
    it('chama RecusarOrcamentoUseCase com o motivo do body', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.recusarOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new RecusarOrcamentoDto();
      dto.negocioId = 'neg-1';
      dto.motivo = 'preço alto';

      const resultado = await controller.recusar('orc-1', dto);

      expect(useCases.recusarOrcamentoUseCase.executar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
        motivo: 'preço alto',
      });
      expect(resultado).toBe(output);
    });
  });

  describe('cancelar (POST /admin/orcamentos/:id/cancelar)', () => {
    it('chama CancelarOrcamentoUseCase com o motivo do body', async () => {
      const { controller, useCases } = montar();
      const output = criarOutput();
      useCases.cancelarOrcamentoUseCase.executar = jest
        .fn()
        .mockResolvedValue(output);
      const dto = new CancelarOrcamentoDto();
      dto.negocioId = 'neg-1';
      dto.motivo = 'cliente duplicado';

      const resultado = await controller.cancelar('orc-1', dto);

      expect(useCases.cancelarOrcamentoUseCase.executar).toHaveBeenCalledWith({
        negocioId: 'neg-1',
        orcamentoId: 'orc-1',
        motivo: 'cliente duplicado',
      });
      expect(resultado).toBe(output);
    });
  });
});
