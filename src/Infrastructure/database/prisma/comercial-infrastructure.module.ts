import { Module } from "@nestjs/common";
import { OrcamentosRepository } from "../../../Application/comercial/repositories/OrcamentosRepository";
import { PrismaModule } from "./prisma.module";
import { PrismaOrcamentosRepository } from "./repositories/prisma-orcamentos.repository";

// ComercialInfrastructureModule — registra a implementação Prisma do contrato
// OrcamentosRepository para injeção nos use-cases do comercial.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: OrcamentosRepository,
      useClass: PrismaOrcamentosRepository,
    },
  ],
  exports: [OrcamentosRepository],
})
export class ComercialInfrastructureModule {}
