import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../Infrastructure/database/prisma/prisma.service';

// HealthController — endpoint mínimo de diagnóstico.
// Verifica a conectividade com o banco via SELECT 1 (não depende de tabela).
// Não derruba a aplicação quando o banco está fora: retorna status degradado.
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return { status: 'ok', banco: 'conectado' };
    } catch (error) {
      return {
        status: 'degraded',
        banco: 'indisponivel',
        detalhe: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
