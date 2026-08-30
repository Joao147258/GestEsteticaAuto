import { Module } from '@nestjs/common';
import { EstoqueVendaController } from './estoque-venda.controller';
import { EstoqueVendaService } from './estoque-venda.service';

@Module({
  controllers: [EstoqueVendaController],
  providers: [EstoqueVendaService],
})
export class EstoqueVendaModule {}
