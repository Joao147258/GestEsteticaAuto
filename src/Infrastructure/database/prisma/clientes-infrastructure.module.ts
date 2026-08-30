import { Module } from "@nestjs/common";
import { ClientesRepository } from "../../../Application/clientes/repositories/clientes.repository";
import { PrismaModule } from "./prisma.module";
import { PrismaClientesRepository } from "./repositories/prisma-clientes.repository";

// ClientesInfrastructureModule — registra a implementação Prisma do contrato
// ClientesRepository. Qualquer use-case que dependa do contrato abstrato
// recebe automaticamente esta implementação via injeção de dependência.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ClientesRepository,
      useClass: PrismaClientesRepository,
    },
  ],
  exports: [ClientesRepository],
})
export class ClientesInfrastructureModule {}
