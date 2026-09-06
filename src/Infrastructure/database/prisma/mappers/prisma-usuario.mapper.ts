import { Usuario } from '../../../../Domain/negocio/usuario';
import type { Usuario as RawPrismaUsuario } from '../../../../generated/prisma/client';

// PrismaUsuarioMapper — converte registros da tabela Usuario (Prisma) para a entidade de domínio Usuario e vice-versa.
export class PrismaUsuarioMapper {
  static toDomain(raw: RawPrismaUsuario): Usuario {
    return Usuario.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      nome: raw.nome,
      username: raw.username ?? null,
      email: raw.email,
      senhaHash: raw.senhaHash,
      ativo: raw.ativo,
      role: raw.role ?? "ADMIN",
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  static toPrisma(usuario: Usuario): RawPrismaUsuario {
    return {
      id: usuario.id,
      negocioId: usuario.negocioId,
      nome: usuario.nome,
      username: usuario.username ?? null,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      ativo: usuario.ativo,
      role: usuario.role ?? "ADMIN",
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm,
    };
  }
}
