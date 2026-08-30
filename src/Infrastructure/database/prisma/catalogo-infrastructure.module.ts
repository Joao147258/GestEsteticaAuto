import { Module } from "@nestjs/common";
import { ConsumosInsumoServicoRepository } from "../../../Application/catalogo/repositories/consumos-insumo-servico.repository";
import { ProdutosRepository } from "../../../Application/catalogo/repositories/produtos.repository";
import { ServicosRepository } from "../../../Application/catalogo/repositories/servicos.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaConsumosInsumoServicoRepository } from "./repositories/prisma-consumos-insumo-servico.repository";
import { PrismaProdutosRepository } from "./repositories/prisma-produtos.repository";
import { PrismaServicosRepository } from "./repositories/prisma-servicos.repository";

// CatalogoInfrastructureModule — registra as implementações Prisma dos
// contratos de catálogo (serviços, produtos e consumo de insumo por serviço).
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ServicosRepository,
      useClass: PrismaServicosRepository,
    },
    {
      provide: ProdutosRepository,
      useClass: PrismaProdutosRepository,
    },
    {
      provide: ConsumosInsumoServicoRepository,
      useClass: PrismaConsumosInsumoServicoRepository,
    },
  ],
  exports: [ServicosRepository, ProdutosRepository, ConsumosInsumoServicoRepository],
})
export class CatalogoInfrastructureModule {}
