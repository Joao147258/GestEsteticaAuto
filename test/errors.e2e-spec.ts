import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CriarOrcamentoUseCase } from './../src/Application/comercial';
import { ComercialError } from './../src/Domain/comercial';
import { AppModule } from './../src/Presentation/app.module';
import { ApplicationExceptionFilter } from './../src/Presentation/http/filters/application-exception.filter';
import { HttpExceptionFilter } from './../src/Presentation/http/filters/http-exception.filter';
import { validationPipeConfig } from './../src/Presentation/http/pipes/validation-pipe.config';
import { NotFoundError } from './../src/Shared/errors/not-found.error';
import { ValidationError } from './../src/Shared/errors/validation.error';

// Resposta de erro padronizada (e2e).
// Reproduz o bootstrap real (main.ts aplica os mesmos pipes e filtros globais)
// e exercita a tradução de erros da Application/Domain para HTTP com mocks dos
// use cases — sem banco real, sem Prisma.
describe('Resposta de erro padronizada (e2e)', () => {
  let app: INestApplication;

  const executarCriar = jest.fn();

  beforeEach(async () => {
    executarCriar.mockReset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CriarOrcamentoUseCase)
      .useValue({ executar: executarCriar })
      .compile();

    app = moduleFixture.createNestApplication();
    // Mesmos pipes e filtros globais do main.ts. O NestJS dá precedência ao
    // último filtro registrado: o específico (HttpException) vem por último.
    app.useGlobalPipes(validationPipeConfig);
    app.useGlobalFilters(
      new ApplicationExceptionFilter(),
      new HttpExceptionFilter(),
    );
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
      itens: [{ servicoId: 'serv-1', quantidade: 1, valorUnitario: 120 }],
    };
  }

  it('ValidationError retorna 400 no formato padronizado', async () => {
    executarCriar.mockRejectedValue(
      new ValidationError('Já existe um veículo com esta placa.'),
    );

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(400);
    expect(resposta.body).toMatchObject({
      statusCode: 400,
      message: 'Já existe um veículo com esta placa.',
      error: 'Bad Request',
      path: '/admin/orcamentos',
    });
    expect(resposta.body).toHaveProperty('timestamp');
  });

  it('NotFoundError retorna 404 no formato padronizado', async () => {
    executarCriar.mockRejectedValue(new NotFoundError('Cliente não encontrado.'));

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(404);
    expect(resposta.body).toMatchObject({
      statusCode: 404,
      message: 'Cliente não encontrado.',
      error: 'Not Found',
      path: '/admin/orcamentos',
    });
  });

  it('erro de regra de negócio (ComercialError) retorna 400', async () => {
    executarCriar.mockRejectedValue(
      new ComercialError('Apenas orçamento EM_ABERTO pode ser aceito'),
    );

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(400);
    expect(resposta.body).toMatchObject({
      statusCode: 400,
      message: 'Apenas orçamento EM_ABERTO pode ser aceito',
      error: 'Bad Request',
    });
  });

  it('HttpException do Nest mantém o status original', async () => {
    executarCriar.mockRejectedValue(
      new NotFoundException('Recurso simulado não encontrado.'),
    );

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(404);
    expect(resposta.body).toMatchObject({
      statusCode: 404,
      message: 'Recurso simulado não encontrado.',
      error: 'Not Found',
      path: '/admin/orcamentos',
    });
  });

  it('erro inesperado retorna 500 sem stack trace', async () => {
    executarCriar.mockRejectedValue(
      new Error('segredo interno do banco de dados'),
    );

    const resposta = await request(app.getHttpServer())
      .post('/admin/orcamentos')
      .send(payloadValido());

    expect(resposta.status).toBe(500);
    expect(resposta.body).toMatchObject({
      statusCode: 500,
      message: 'Erro interno do servidor.',
      error: 'Internal Server Error',
      path: '/admin/orcamentos',
    });
    expect(JSON.stringify(resposta.body)).not.toContain(
      'segredo interno do banco de dados',
    );
    expect(JSON.stringify(resposta.body)).not.toContain('stack');
  });
});
