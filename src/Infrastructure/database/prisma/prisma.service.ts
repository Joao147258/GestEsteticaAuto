import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
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
      this.logger.warn(
        `PrismaService não conectou ao PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
