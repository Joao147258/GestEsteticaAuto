import { Module } from "@nestjs/common";
import { OrdensServicoRepository } from "../../../Application/operacao/repositories/ordens-servico.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaOrdensServicoRepository } from "./repositories/prisma-ordens-servico.repository";

// OperacaoInfrastructureModule — registra a implementação Prisma do contrato
// OrdensServicoRepository para injeção nos use-cases da operação.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: OrdensServicoRepository,
      useClass: PrismaOrdensServicoRepository,
    },
  ],
  exports: [OrdensServicoRepository],
})
export class OperacaoInfrastructureModule {}
