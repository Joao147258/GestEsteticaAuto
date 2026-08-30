import { Injectable } from "@nestjs/common";
import { Veiculo } from "../../../../Domain";
import { VeiculosRepository } from "../../../../Application/veiculos/repositories/veiculos.repository";
import { PrismaService } from "../prisma.service";
import { PrismaVeiculoMapper } from "../mappers/prisma-veiculo.mapper";

// PrismaVeiculosRepository — implementação concreta do contrato de veículos.
// Toda query escopada por negocioId; placa é opcional no banco. Não valida
// formato de placa nem decide regras — retorna null quando não encontra.
@Injectable()
export class PrismaVeiculosRepository implements VeiculosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(veiculo: Veiculo): Promise<void> {
    const data = PrismaVeiculoMapper.toPrisma(veiculo);

    await this.prisma.veiculo.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async buscarPorId(
    negocioId: string,
    veiculoId: string,
  ): Promise<Veiculo | null> {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id: veiculoId, negocioId },
    });

    return veiculo ? PrismaVeiculoMapper.toDomain(veiculo) : null;
  }

  async buscarPorPlaca(
    negocioId: string,
    placa: string,
  ): Promise<Veiculo | null> {
    const placaNormalizada = placa?.trim();
    if (!placaNormalizada) {
      return null;
    }

    const veiculo = await this.prisma.veiculo.findFirst({
      where: { negocioId, placa: placaNormalizada },
    });

    return veiculo ? PrismaVeiculoMapper.toDomain(veiculo) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Veiculo[]> {
    const { negocioId, clienteId, busca } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const veiculos = await this.prisma.veiculo.findMany({
      where: {
        negocioId,
        ...(clienteId ? { clienteId } : {}),
        ...(busca?.trim()
          ? {
              OR: [
                { placa: { contains: busca, mode: "insensitive" } },
                { marca: { contains: busca, mode: "insensitive" } },
                { modelo: { contains: busca, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { criadoEm: "desc" },
    });

    return veiculos.map(PrismaVeiculoMapper.toDomain);
  }

  async remover(negocioId: string, veiculoId: string): Promise<void> {
    await this.prisma.veiculo.deleteMany({
      where: { id: veiculoId, negocioId },
    });
  }
}
