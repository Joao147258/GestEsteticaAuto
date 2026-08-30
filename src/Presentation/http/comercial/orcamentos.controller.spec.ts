import {
  CriarOrcamentoUseCase,
  OrcamentoOutputDTO,
} from '../../../Application/comercial';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { OrcamentosController } from './orcamentos.controller';

describe('OrcamentosController', () => {
  function montar() {
    const executar =
      jest.fn() as jest.MockedFunction<CriarOrcamentoUseCase['executar']>;
    const criarOrcamentoUseCase = { executar } as unknown as CriarOrcamentoUseCase;
    const controller = new OrcamentosController(criarOrcamentoUseCase);
    return { controller, executar };
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

  it("chama CriarOrcamentoUseCase com os dados do DTO e retorna o resultado", async () => {
    const { controller, executar } = montar();
    const output = criarOutput();
    executar.mockResolvedValue(output);

    const resultado = await controller.criar(criarDto());

    expect(executar).toHaveBeenCalledTimes(1);
    expect(executar).toHaveBeenCalledWith(
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

  it("força origem PAINEL na rota administrativa", async () => {
    const { controller, executar } = montar();
    executar.mockResolvedValue(criarOutput());

    await controller.criar(criarDto());

    expect(executar).toHaveBeenCalledWith(
      expect.objectContaining({ origem: 'PAINEL' }),
    );
  });

  it("o DTO HTTP não expõe origem (rota admin não aceita SITE)", () => {
    const dto = new CriarOrcamentoDto();
    expect(dto).not.toHaveProperty('origem');
  });

  it("não acessa Prisma diretamente — depende apenas do use case", () => {
    const { controller } = montar();
    const dependencias = controller as unknown as Record<string, unknown>;

    expect(dependencias).not.toHaveProperty('prisma');
    expect(dependencias).not.toHaveProperty('prismaService');
  });

  it("não contém regra de negócio — propaga o erro do use case", async () => {
    const { controller, executar } = montar();
    executar.mockRejectedValue(new Error('erro de domínio'));

    await expect(controller.criar(criarDto())).rejects.toThrow(
      'erro de domínio',
    );
  });
});
