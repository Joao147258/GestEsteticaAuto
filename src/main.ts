import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Presentation/app.module';
import { validationPipeConfig } from './Presentation/http/pipes/validation-pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global de entrada: todos os DTOs da Presentation passam pelo
  // mesmo ValidationPipe (whitelist + forbidNonWhitelisted + transform).
  // Campos não declarados no DTO são rejeitados com 400 — nada de regra de
  // negócio aqui, apenas saneamento do contrato HTTP.
  app.useGlobalPipes(validationPipeConfig);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
