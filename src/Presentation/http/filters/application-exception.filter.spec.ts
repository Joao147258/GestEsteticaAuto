import { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ComercialError } from '../../../Domain/comercial';
import { AppError } from '../../../Shared/errors/app-error';
import { ForbiddenError } from '../../../Shared/errors/forbidden.error';
import { NotFoundError } from '../../../Shared/errors/not-found.error';
import { UnauthorizedError } from '../../../Shared/errors/unauthorized.error';
import { ValidationError } from '../../../Shared/errors/validation.error';
import { ApplicationExceptionFilter } from './application-exception.filter';

describe('ApplicationExceptionFilter', () => {
  let filter: ApplicationExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  function montarHost() {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = { url: '/admin/orcamentos' } as Request;
    host = {
      switchToHttp: () => ({
        getResponse: () => response as unknown as Response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;
  }

  beforeEach(() => {
    filter = new ApplicationExceptionFilter();
    montarHost();
  });

  function capturarResposta() {
    return response.json.mock.calls[0][0];
  }

  it('traduz NotFoundError para 404 com mensagem preservada', () => {
    filter.catch(new NotFoundError('Cliente não encontrado.'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(capturarResposta()).toMatchObject({
      statusCode: 404,
      message: 'Cliente não encontrado.',
      error: 'Not Found',
      path: '/admin/orcamentos',
    });
  });

  it('traduz ValidationError para 400', () => {
    filter.catch(
      new ValidationError('Já existe outro veículo com esta placa.'),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(capturarResposta()).toMatchObject({
      statusCode: 400,
      message: 'Já existe outro veículo com esta placa.',
      error: 'Bad Request',
    });
  });

  it('traduz ForbiddenError para 403', () => {
    filter.catch(new ForbiddenError('Sem permissão.'), host);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(capturarResposta()).toMatchObject({
      statusCode: 403,
      error: 'Forbidden',
    });
  });

  it('traduz UnauthorizedError para 401', () => {
    filter.catch(new UnauthorizedError('Token inválido.'), host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(capturarResposta()).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
    });
  });

  it('traduz ComercialError (regra de negócio) para 400', () => {
    filter.catch(
      new ComercialError('Apenas orçamento RASCUNHO pode ser aberto'),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(capturarResposta()).toMatchObject({
      statusCode: 400,
      message: 'Apenas orçamento RASCUNHO pode ser aberto',
      error: 'Bad Request',
    });
  });

  it('retorna 500 seguro para AppError não classificado', () => {
    filter.catch(new AppError('detalhe interno não deve vazar'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(capturarResposta()).toMatchObject({
      statusCode: 500,
      message: 'Erro interno do servidor.',
      error: 'Internal Server Error',
    });
  });

  it('retorna 500 seguro para erro desconhecido sem stack trace', () => {
    filter.catch(new Error('segredo do banco'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    const corpo = capturarResposta();
    expect(corpo).toMatchObject({
      statusCode: 500,
      message: 'Erro interno do servidor.',
      error: 'Internal Server Error',
    });
    expect(JSON.stringify(corpo)).not.toContain('segredo do banco');
    expect(JSON.stringify(corpo)).not.toContain('stack');
  });

  it('resposta inclui statusCode, message, error, path e timestamp', () => {
    filter.catch(new NotFoundError('X não encontrado.'), host);

    const corpo = capturarResposta();
    expect(corpo).toHaveProperty('statusCode');
    expect(corpo).toHaveProperty('message');
    expect(corpo).toHaveProperty('error');
    expect(corpo).toHaveProperty('path');
    expect(corpo).toHaveProperty('timestamp');
    expect(typeof corpo.timestamp).toBe('string');
  });
});
