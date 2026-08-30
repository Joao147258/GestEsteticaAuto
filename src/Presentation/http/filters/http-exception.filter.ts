import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { montarCorpoErro } from './error-http-response';

// Captura HttpException do NestJS (BadRequestException do ValidationPipe,
// NotFoundException, etc.) e devolve no formato padrão, preservando o status
// original. A Presentation apenas traduz para HTTP — sem regra de negócio.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();
    const responseBody = exception.getResponse();

    // O ValidationPipe (whitelist + forbidNonWhitelisted) devolve o erro como
    // objeto com message em formato de array. Erros manuais podem vir como
    // string. Normalizamos os dois para o mesmo formato.
    let message: string | string[] = exception.message;
    let error: string | undefined;

    if (typeof responseBody === 'object' && responseBody !== null) {
      const body = responseBody as Record<string, unknown>;
      if (Array.isArray(body.message)) {
        message = body.message as string[];
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
      if (typeof body.error === 'string') {
        error = body.error;
      }
    }

    response
      .status(statusCode)
      .json(montarCorpoErro(statusCode, message, request.url, error));
  }
}
