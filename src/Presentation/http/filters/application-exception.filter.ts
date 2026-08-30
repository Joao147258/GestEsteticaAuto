import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(_exception: unknown, _host: ArgumentsHost) {}
}
