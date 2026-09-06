import { Injectable } from '@nestjs/common';
import { Usuario } from '../../../../Domain/negocio/usuario';
import { UsuariosRepository } from '../../../../Application/usuarios/repositories/usuarios.repository';
import { PrismaService } from '../prisma.service';
import { PrismaUsuarioMapper } from '../mappers/prisma-usuario.mapper';

// PrismaUsuariosRepository — persistência de usuários com Prisma no PostgreSQL.
// Permite salvar, buscar por ID, email e por identificador textual (username ou email completo).
@Injectable()
export class PrismaUsuariosRepository implements UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(usuario: Usuario): Promise<void> {
    const data = PrismaUsuarioMapper.toPrisma(usuario);
    await this.prisma.usuario.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { id },
    });
    return raw ? PrismaUsuarioMapper.toDomain(raw) : null;
  }

  async buscarPorEmail(negocioId: string, email: string): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findFirst({
      where: {
        negocioId,
        email: { equals: email.trim(), mode: 'insensitive' },
      },
    });
    return raw ? PrismaUsuarioMapper.toDomain(raw) : null;
  }

  async buscarPorIdentificador(identificador: string): Promise<Usuario | null> {
    const idf = identificador.trim();
    const raw = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { username: { equals: idf, mode: 'insensitive' } },
          { email: { equals: idf, mode: 'insensitive' } },
          { email: { startsWith: `${idf}@`, mode: 'insensitive' } },
        ],
      },
    });
    return raw ? PrismaUsuarioMapper.toDomain(raw) : null;
  }

  async listarPorNegocio(negocioId: string): Promise<Usuario[]> {
    const raws = await this.prisma.usuario.findMany({
      where: { negocioId },
      orderBy: { nome: 'asc' },
    });
    return raws.map(PrismaUsuarioMapper.toDomain);
  }
}
