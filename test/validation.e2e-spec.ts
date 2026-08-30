import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  CriarOrcamentoUseCase,
  ListarOrcamentosUseCase,
} from './../src/Application/comercial';
import { AppModule } from './../src/Presentation/app.module';
import { validationPipeConfig } from './../src/Presentation/http/pipes/validation-pipe.config';

// Validação global de entrada (e2e).
// Reproduz o bootstrap real (main.ts aplica o mesmo validationPipeConfig) e
// exercita o comportamento do pipe com mocks dos use cases — sem banco real,
// sem Prisma. Testa o saneamento do contrato HTTP, não regra de negócio.
describe('Validação global de entrada (e2e)', () => {
  let app: INestApplication;

  const executarCriar = jest.fn();
  const executarListar = jest.fn();

  beforeEach(async () => {
    executarCriar.mockReset();
    executarListar.mockReset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CriarOrcamentoUseCase)
      .useValue({ executar: executarCriar })
      .overrideProvider(ListarOrcamentosUseCase)
      .useValue({ executar: executarListar })
      .compile();

    app = moduleFixture.createNestApplication();
    // Mesmo pipe global do main.ts, para o teste refletir o comportamento real.
    app.useGlobalPipes(validationPipeConfig);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function payloadValido() {
    return {
      negocioId: 'neg-1',
      clienteId: 'cli-1',
      veiculoId: 'vei-1',
      observacoes: 'cliente pediu desconto',
      itens: [{ servicoId: 'serv-1', quantidade: 1, valorUnitario: 120 }],
    };
  }

  it('aplicaçao sobe com o pipe global aplicado', () => {
    expect(app).toBeDefined();
  });

  it('rejeita campos extras no body com 400', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send({ ...payloadValido(), campoDesconhecido: 'x' });

    expect(resposta.status).toBe(400);
    expect(executarCriar).not.toHaveBeenCalled();
  });

  it('rejeita origem no body de POST /admin/orcamentos com 400', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send({ ...payloadValido(), origem: 'SITE' });

    expect(resposta.status).toBe(400);
    expect(executarCriar).not.toHaveBeenCalled();
  });

  it('rejeita payload inválido (campo obrigatório ausente) com 400', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send({ negocioId: 'neg-1' });

    expect(resposta.status).toBe(400);
    expect(executarCriar).not.toHaveBeenCalled();
  });

  it('aceita body válido e repassa ao use case', async () => {
    executarCriar.mockResolvedValue({});

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(201);
    expect(executarCriar).toHaveBeenCalled();
  });

  it('query params válidos continuam funcionando no GET', async () => {
    executarListar.mockResolvedValue([]);

    const resposta = await request(app.getHttpServer())
      .get('/admin/orcamentos')
      .query({
        negocioId: 'neg-1',
        status: 'RASCUNHO',
        busca: 'polimento',
        pagina: '2',
        limite: '10',
      });

    expect(resposta.status).toBe(200);
    expect(executarListar).toHaveBeenCalledWith({
      negocioId: 'neg-1',
      status: 'RASCUNHO',
      busca: 'polimento',
      pagina: 2,
      limite: 10,
    });
  });

  it('rejeita query sem negocioId obrigatório com 400', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/admin/orcamentos')
      .query({ status: 'RASCUNHO' });

    expect(resposta.status).toBe(400);
    expect(executarListar).not.toHaveBeenCalled();
  });

  it('rejeita status inválido na query com 400', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/admin/orcamentos')
      .query({ negocioId: 'neg-1', status: 'INVALIDO' });

    expect(resposta.status).toBe(400);
    expect(executarListar).not.toHaveBeenCalled();
  });
});
