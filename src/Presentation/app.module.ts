import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from '../Infrastructure/infrastructure.module';
import { AuthModule } from './http/auth/auth.module';
import { NegociosModule } from './http/negocio/negocios.module';
import { UsuariosModule } from './http/usuarios/usuarios.module';
import { ClientesModule } from './http/clientes/clientes.module';
import { VeiculosModule } from './http/veiculos/veiculos.module';
import { CatalogoModule } from './http/catalogo/catalogo.module';
import { ComercialModule } from './http/comercial/comercial.module';
import { OperacaoModule } from './http/operacao/operacao.module';
import { FinanceiroModule } from './http/financeiro/financeiro.module';
import { EstoqueInternoModule } from './http/estoque-interno/estoque-interno.module';
import { EstoqueVendaModule } from './http/estoque-venda/estoque-venda.module';
import { IntegracoesModule } from './http/integracoes/integracoes.module';
import { DashboardModule } from './http/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    AuthModule,
    NegociosModule,
    UsuariosModule,
    ClientesModule,
    VeiculosModule,
    CatalogoModule,
    ComercialModule,
    OperacaoModule,
    FinanceiroModule,
    EstoqueInternoModule,
    EstoqueVendaModule,
    IntegracoesModule,
    DashboardModule,
  ],
})
export class AppModule {}
