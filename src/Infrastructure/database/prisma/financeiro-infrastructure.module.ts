import { Module } from "@nestjs/common";
import { TitulosReceberRepository } from "../../../Application/financeiro/repositories/titulos-receber.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaTitulosReceberRepository } from "./repositories/prisma-titulos-receber.repository";

// FinanceiroInfrastructureModule — registra a implementação Prisma do contrato
// TitulosReceberRepository para injeção nos use-cases do financeiro.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TitulosReceberRepository,
      useClass: PrismaTitulosReceberRepository,
    },
  ],
  exports: [TitulosReceberRepository],
})
export class FinanceiroInfrastructureModule {}
