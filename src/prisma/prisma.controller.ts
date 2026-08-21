import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaController — endpoint técnico TEMPORÁRIO de diagnóstico.
 *
 * Objetivo: validar que a camada Prisma está devidamente injetada e que a
 * infraestrutura NestJS + Prisma funciona.
 *
 * NÃO é um endpoint de negócio: não cria, edita ou lista dados de domínio.
 * A verificação usa `SELECT 1`, que não depende de nenhuma tabela.
 *
 * Em produção, este controller deve ser removido ou isolado da API pública.
 */
@Controller('prisma')
export class PrismaController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        prisma: 'disponivel',
        banco: 'conectado',
      };
    } catch (error) {
      return {
        status: 'degraded',
        prisma: 'instanciado',
        banco: 'indisponivel',
        detalhe: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
