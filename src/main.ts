import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Presentation/app.module';
import { ApplicationExceptionFilter } from './Presentation/http/filters/application-exception.filter';
import { HttpExceptionFilter } from './Presentation/http/filters/http-exception.filter';
import { validationPipeConfig } from './Presentation/http/pipes/validation-pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global de entrada: todos os DTOs da Presentation passam pelo
  // mesmo ValidationPipe (whitelist + forbidNonWhitelisted + transform).
  // Campos não declarados no DTO são rejeitados com 400 — nada de regra de
  // negócio aqui, apenas saneamento do contrato HTTP.
  app.useGlobalPipes(validationPipeConfig);

  // Filtros globais de erro: HttpException do Nest mantém o status original;
  // erros da Application/Domain são traduzidos para HTTP no formato padrão.
  // Ordem importa: o NestJS dá precedência ao ÚLTIMO filtro registrado, então
  // o específico (HttpException) deve vir depois do catch-all (Application).
  app.useGlobalFilters(
    new ApplicationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // CORS: origens permitidas vêm de CORS_ORIGINS (env, separadas por vírgula).
  // Sem a variável, libera apenas localhost de desenvolvimento. NUNCA usamos
  // origin: true — em produção a lista vem do ambiente do Coolify.
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins?.length
      ? corsOrigins
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
