import { Module } from "@nestjs/common";
import { AuthInfrastructureModule } from "./auth/auth-infrastructure.module";
import { CatalogoInfrastructureModule } from "./database/prisma/catalogo-infrastructure.module";
import { ClientesInfrastructureModule } from "./database/prisma/clientes-infrastructure.module";
import { ComercialInfrastructureModule } from "./database/prisma/comercial-infrastructure.module";
import { EstoqueInternoInfrastructureModule } from "./database/prisma/estoque-interno-infrastructure.module";
import { FinanceiroInfrastructureModule } from "./database/prisma/financeiro-infrastructure.module";
import { OperacaoInfrastructureModule } from "./database/prisma/operacao-infrastructure.module";
import { UsuariosInfrastructureModule } from "./database/prisma/usuarios-infrastructure.module";
import { VeiculosInfrastructureModule } from "./database/prisma/veiculos-infrastructure.module";

// InfrastructureModule — raiz da camada de infraestrutura. Agrega e exporta
// os módulos de cada domínio, registrando os repositories Prisma. Os
// use-cases da Application recebem as implementações concretas via DI.
@Module({
  imports: [
    ClientesInfrastructureModule,
    VeiculosInfrastructureModule,
    CatalogoInfrastructureModule,
    ComercialInfrastructureModule,
    EstoqueInternoInfrastructureModule,
    OperacaoInfrastructureModule,
    FinanceiroInfrastructureModule,
    UsuariosInfrastructureModule,
    AuthInfrastructureModule,
  ],
  exports: [
    ClientesInfrastructureModule,
    VeiculosInfrastructureModule,
    CatalogoInfrastructureModule,
    ComercialInfrastructureModule,
    EstoqueInternoInfrastructureModule,
    OperacaoInfrastructureModule,
    FinanceiroInfrastructureModule,
    UsuariosInfrastructureModule,
    AuthInfrastructureModule,
  ],
})
export class InfrastructureModule {}
