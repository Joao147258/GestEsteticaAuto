import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(_exception: unknown, _host: ArgumentsHost) {}
}
