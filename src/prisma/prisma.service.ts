import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * PrismaService — ponto único de acesso ao Prisma Client na aplicação.
 *
 * - Estende `PrismaClient` e usa o driver adapter do PostgreSQL
 *   (`@prisma/adapter-pg`), que é obrigatório no Prisma 7 para conectar.
 * - Lê a URL de conexão de `DATABASE_URL` via `ConfigService` (variáveis de
 *   ambiente), sem expor credenciais no código.
 * - Cuida do lifecycle: conecta no `onModuleInit` e desconecta no
 *   `onModuleDestroy`.
 * - NÃO contém regra de negócio — apenas disponibiliza a instância para a
 *   camada de persistência.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('Variável de ambiente DATABASE_URL não configurada.');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('PrismaService conectado ao PostgreSQL.');
    } catch (error) {
      // Em dev local o host do banco (rede interna do Coolify) pode estar
      // inacessível. Não derrubamos a aplicação: o PrismaController reporta o
      // estado real da conexão no endpoint de diagnóstico.
      this.logger.warn(
        `PrismaService não conectou ao PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
