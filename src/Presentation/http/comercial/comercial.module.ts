import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../../Infrastructure/infrastructure.module';
import { CriarOrcamentoUseCase } from '../../../Application/comercial';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';

// ComercialModule — camada HTTP do comercial. Importa a infraestrutura para
// que o Nest resolva as dependências do CriarOrcamentoUseCase (os tokens
// abstratos OrcamentosRepository, ClientesRepository e ServicosRepository são
// providos pelos módulos de infraestrutura) e registra o use case como
// provider, injetável no controller.
@Module({
  imports: [InfrastructureModule],
  controllers: [OrcamentosController],
  providers: [
    OrcamentosService,
    { provide: CriarOrcamentoUseCase, useClass: CriarOrcamentoUseCase },
  ],
})
export class ComercialModule {}
