import { Module } from '@nestjs/common';
import { EstoqueInternoController } from './estoque-interno.controller';
import { EstoqueInternoService } from './estoque-interno.service';

@Module({
  controllers: [EstoqueInternoController],
  providers: [EstoqueInternoService],
})
export class EstoqueInternoModule {}
