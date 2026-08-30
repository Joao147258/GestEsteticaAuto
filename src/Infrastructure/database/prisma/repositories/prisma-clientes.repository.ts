import { Injectable } from "@nestjs/common";
import { Cliente } from "../../../../Domain";
import { ClientesRepository } from "../../../../Application/clientes/repositories/clientes.repository";
import { PrismaService } from "../prisma.service";
import { PrismaClienteMapper } from "../mappers/prisma-cliente.mapper";

// PrismaClientesRepository — implementação concreta do contrato da
// Application usando Prisma. Tradução de dados via mapper; toda query é
// escopada por negocioId (multi-tenant). NÃO decide regras: se não encontra
// o cliente, retorna null — quem decide o erro é a Application.
@Injectable()
export class PrismaClientesRepository implements ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Upsert: mesma chamada serve para criação e atualização (guia, opção A).
  // O id vem do domínio (criado com randomUUID na entidade).
  async salvar(cliente: Cliente): Promise<void> {
    const data = PrismaClienteMapper.toPrisma(cliente);

    await this.prisma.cliente.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async buscarPorId(
    negocioId: string,
    clienteId: string,
  ): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, negocioId },
    });

    return cliente ? PrismaClienteMapper.toDomain(cliente) : null;
  }

  async buscarPorDocumento(
    negocioId: string,
    documento: string,
  ): Promise<Cliente | null> {
    // A Application só chama este método quando há documento; ainda assim,
    // documento vazio não pode casar com cliente sem CPF/CNPJ cadastrado.
    if (!documento?.trim()) {
      return null;
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: { negocioId, cpfCnpj: documento },
    });

    return cliente ? PrismaClienteMapper.toDomain(cliente) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Cliente[]> {
    const { negocioId, busca } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const clientes = await this.prisma.cliente.findMany({
      where: {
        negocioId,
        ...(busca?.trim()
          ? {
              OR: [
                { nome: { contains: busca, mode: "insensitive" } },
                { cpfCnpj: { contains: busca, mode: "insensitive" } },
                { email: { contains: busca, mode: "insensitive" } },
                { telefone: { contains: busca, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { criadoEm: "desc" },
    });

    return clientes.map(PrismaClienteMapper.toDomain);
  }

  async remover(negocioId: string, clienteId: string): Promise<void> {
    await this.prisma.cliente.deleteMany({
      where: { id: clienteId, negocioId },
    });
  }
}
