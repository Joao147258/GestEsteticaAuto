import { Controller, Get } from '@nestjs/common';

@Controller('prisma')
export class PrismaController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'prisma' };
  }
}
