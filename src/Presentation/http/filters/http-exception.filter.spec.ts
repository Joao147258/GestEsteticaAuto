import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
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
    filter = new HttpExceptionFilter();
    montarHost();
  });

  function capturarResposta() {
    return response.json.mock.calls[0][0];
  }

  it('mantém o status original da HttpException', () => {
    filter.catch(new NotFoundException('Orçamento não encontrado.'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(capturarResposta()).toMatchObject({
      statusCode: 404,
      message: 'Orçamento não encontrado.',
      error: 'Not Found',
      path: '/admin/orcamentos',
    });
  });

  it('formata erro de validação do ValidationPipe com details', () => {
    const body = new BadRequestException([
      'clienteId should not be empty',
      'negocioId must be a string',
    ]);

    filter.catch(body, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(capturarResposta()).toMatchObject({
      statusCode: 400,
      message: 'Erro de validação',
      error: 'Bad Request',
      details: ['clienteId should not be empty', 'negocioId must be a string'],
    });
  });

  it('resposta inclui statusCode, message, error, path e timestamp', () => {
    filter.catch(new BadRequestException('algo inválido'), host);

    const corpo = capturarResposta();
    expect(corpo).toHaveProperty('statusCode');
    expect(corpo).toHaveProperty('message');
    expect(corpo).toHaveProperty('error');
    expect(corpo).toHaveProperty('path');
    expect(corpo).toHaveProperty('timestamp');
  });
});
