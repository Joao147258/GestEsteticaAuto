import { Module } from "@nestjs/common";
import { VeiculosRepository } from "../../../Application/veiculos/repositories/veiculos.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaVeiculosRepository } from "./repositories/prisma-veiculos.repository";

// VeiculosInfrastructureModule — registra a implementação Prisma do contrato
// VeiculosRepository para injeção nos use-cases da Application.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: VeiculosRepository,
      useClass: PrismaVeiculosRepository,
    },
  ],
  exports: [VeiculosRepository],
})
export class VeiculosInfrastructureModule {}
