import { Injectable } from "@nestjs/common";
import { Servico } from "../../../../Domain";
import { ServicosRepository } from "../../../../Application/catalogo/repositories/servicos.repository";
import { PrismaService } from "../prisma.service";
import { PrismaServicoMapper } from "../mappers/prisma-servico.mapper";

// PrismaServicosRepository — implementação concreta do contrato de serviços.
// Toda query escopada por negocioId; sem regra de negócio (não calcula preço,
// não decide inativação). Retorna null quando não encontra.
@Injectable()
export class PrismaServicosRepository implements ServicosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(servico: Servico): Promise<void> {
    const data = PrismaServicoMapper.toPrisma(servico);

    await this.prisma.servico.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async buscarPorId(
    negocioId: string,
    servicoId: string,
  ): Promise<Servico | null> {
    const servico = await this.prisma.servico.findFirst({
      where: { id: servicoId, negocioId },
    });

    return servico ? PrismaServicoMapper.toDomain(servico) : null;
  }

  async buscarPorNome(
    negocioId: string,
    nome: string,
  ): Promise<Servico | null> {
    const nomeNormalizado = nome?.trim();
    if (!nomeNormalizado) {
      return null;
    }

    const servico = await this.prisma.servico.findFirst({
      where: {
        negocioId,
        nome: { equals: nomeNormalizado, mode: "insensitive" },
      },
    });

    return servico ? PrismaServicoMapper.toDomain(servico) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    ativo?: boolean;
  }): Promise<Servico[]> {
    const { negocioId, busca, ativo } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const servicos = await this.prisma.servico.findMany({
      where: {
        negocioId,
        // ativo=true lista ATIVO; ativo=false lista INATIVO; undefined lista tudo.
        ...(ativo === undefined ? {} : { status: ativo ? "ATIVO" : "INATIVO" }),
        ...(busca?.trim()
          ? {
              OR: [
                { nome: { contains: busca, mode: "insensitive" } },
                { descricao: { contains: busca, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { nome: "asc" },
    });

    return servicos.map(PrismaServicoMapper.toDomain);
  }
}
