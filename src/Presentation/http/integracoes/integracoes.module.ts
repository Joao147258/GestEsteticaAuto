import { Module } from '@nestjs/common';
import { SiteApexController } from './site-apex.controller';
import { IntegracoesService } from './integracoes.service';

@Module({
  controllers: [SiteApexController],
  providers: [IntegracoesService],
})
export class IntegracoesModule {}
