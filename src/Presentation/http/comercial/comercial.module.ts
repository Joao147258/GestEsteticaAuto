import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../../Infrastructure/infrastructure.module';
import {
  AbrirOrcamentoUseCase,
  AdicionarItemOrcamentoUseCase,
  AprovarOrcamentoUseCase,
  AtualizarObservacoesOrcamentoUseCase,
  BuscarOrcamentoPorIdUseCase,
  CancelarOrcamentoUseCase,
  CriarOrcamentoUseCase,
  ListarOrcamentosUseCase,
  RecusarOrcamentoUseCase,
  RemoverItemOrcamentoUseCase,
} from '../../../Application/comercial';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';

// ComercialModule — camada HTTP do comercial. Importa a infraestrutura para
// que o Nest resolva as dependências dos use cases (os tokens abstratos
// OrcamentosRepository, ClientesRepository e ServicosRepository são providos
// pelos módulos de infraestrutura) e registra cada use case como provider,
// injetável no controller.
//
// A rota POST /admin/orcamentos/:id/gerar-os (orçamento → OS) fica de fora:
// o GerarOrdemServicoUseCase ainda não existe na Application. Ela entra numa
// próxima tarefa, quando a integração de aplicação estiver pronta.
@Module({
  imports: [InfrastructureModule],
  controllers: [OrcamentosController],
  providers: [
    OrcamentosService,
    { provide: CriarOrcamentoUseCase, useClass: CriarOrcamentoUseCase },
    { provide: ListarOrcamentosUseCase, useClass: ListarOrcamentosUseCase },
    {
      provide: BuscarOrcamentoPorIdUseCase,
      useClass: BuscarOrcamentoPorIdUseCase,
    },
    { provide: AbrirOrcamentoUseCase, useClass: AbrirOrcamentoUseCase },
    {
      provide: AdicionarItemOrcamentoUseCase,
      useClass: AdicionarItemOrcamentoUseCase,
    },
    {
      provide: RemoverItemOrcamentoUseCase,
      useClass: RemoverItemOrcamentoUseCase,
    },
    {
      provide: AtualizarObservacoesOrcamentoUseCase,
      useClass: AtualizarObservacoesOrcamentoUseCase,
    },
    { provide: AprovarOrcamentoUseCase, useClass: AprovarOrcamentoUseCase },
    { provide: RecusarOrcamentoUseCase, useClass: RecusarOrcamentoUseCase },
    { provide: CancelarOrcamentoUseCase, useClass: CancelarOrcamentoUseCase },
  ],
})
export class ComercialModule {}
