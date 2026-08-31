import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ComercialError } from '../../../Domain/comercial';
import { AppError } from '../../../Shared/errors/app-error';
import { ForbiddenError } from '../../../Shared/errors/forbidden.error';
import { NotFoundError } from '../../../Shared/errors/not-found.error';
import { UnauthorizedError } from '../../../Shared/errors/unauthorized.error';
import { ValidationError } from '../../../Shared/errors/validation.error';
import { montarCorpoErro } from './error-http-response';

// Captura qualquer exceção não tratada por um filtro mais específico
// (HttpExceptionFilter). Traduz erros conhecidos da Application/Domain para
// status HTTP e garante resposta segura (sem stack trace) para o inesperado.
// A tradução de erro → HTTP é responsabilidade da Presentation.
@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // TEMPORÁRIO: log para diagnosticar o 500 na listagem de orçamentos.
    console.error('[ApplicationExceptionFilter]', exception);
    console.error(
      '[ApplicationExceptionFilter stack]',
      exception instanceof Error ? exception.stack : exception,
    );

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.traduzir(exception);

    response.status(statusCode).json(montarCorpoErro(statusCode, message, request.url));
  }

  // Mapeia a hierarquia de erros do projeto para HTTP.
  // - NotFoundError → 404
  // - ValidationError → 400
  // - ForbiddenError → 403
  // - UnauthorizedError → 401
  // - ComercialError (regra de negócio do Domain) → 400
  // - AppError base não classificado → 500 (seguro)
  // - desconhecido → 500 (seguro, sem vazar detalhes internos)
  private traduzir(exception: unknown): { statusCode: number; message: string } {
    if (exception instanceof NotFoundError) {
      return { statusCode: 404, message: exception.message };
    }
    if (exception instanceof ValidationError) {
      return { statusCode: 400, message: exception.message };
    }
    if (exception instanceof ForbiddenError) {
      return { statusCode: 403, message: exception.message };
    }
    if (exception instanceof UnauthorizedError) {
      return { statusCode: 401, message: exception.message };
    }
    if (exception instanceof ComercialError) {
      return { statusCode: 400, message: exception.message };
    }
    if (exception instanceof AppError) {
      return { statusCode: 500, message: 'Erro interno do servidor.' };
    }

    return { statusCode: 500, message: 'Erro interno do servidor.' };
  }
}
