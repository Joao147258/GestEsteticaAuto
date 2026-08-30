import { Module } from "@nestjs/common";
import { EstoqueInternoRepository } from "../../../Application/estoque_interno/repositories/estoque-interno.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaEstoqueInternoRepository } from "./repositories/prisma-estoque-interno.repository";

// EstoqueInternoInfrastructureModule — registra a implementação Prisma do
// contrato EstoqueInternoRepository para injeção nos use-cases.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: EstoqueInternoRepository,
      useClass: PrismaEstoqueInternoRepository,
    },
  ],
  exports: [EstoqueInternoRepository],
})
export class EstoqueInternoInfrastructureModule {}
