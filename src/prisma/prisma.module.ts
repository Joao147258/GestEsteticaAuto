import { Module } from '@nestjs/common';
import { PrismaController } from './prisma.controller';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule — disponibiliza o PrismaService para toda a aplicação.
 * Exporta o serviço para que outros módulos possam injetá-lo.
 */
@Module({
  providers: [PrismaService],
  controllers: [PrismaController],
  exports: [PrismaService],
})
export class PrismaModule {}
