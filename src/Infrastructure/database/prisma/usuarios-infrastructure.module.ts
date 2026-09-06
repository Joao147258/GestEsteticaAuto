import { Module } from '@nestjs/common';
import { UsuariosRepository } from '../../../Application/usuarios/repositories/usuarios.repository';
import { PrismaModule } from './prisma.module';
import { PrismaUsuariosRepository } from './repositories/prisma-usuarios.repository';

// UsuariosInfrastructureModule — provê a implementação Prisma do contrato UsuariosRepository.
// Exporta UsuariosRepository para injeção nos módulos de Auth e Usuários.
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UsuariosRepository,
      useClass: PrismaUsuariosRepository,
    },
  ],
  exports: [UsuariosRepository],
})
export class UsuariosInfrastructureModule {}
