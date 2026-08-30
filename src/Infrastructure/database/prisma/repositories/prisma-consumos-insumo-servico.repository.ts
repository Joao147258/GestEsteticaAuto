import { Injectable } from "@nestjs/common";
import { ConsumoInsumoServico } from "../../../../Domain";
import { ConsumosInsumoServicoRepository } from "../../../../Application/catalogo/repositories/consumos-insumo-servico.repository";
import { PrismaService } from "../prisma.service";
import { PrismaConsumoInsumoServicoMapper } from "../mappers/prisma-consumo-insumo-servico.mapper";

// PrismaConsumosInsumoServicoRepository — implementação concreta do contrato
// de consumo de insumo por serviço. O salvar usa a unicidade
// (negocioId, servicoId, produtoId): se o mesmo insumo já foi configurado
// para o serviço, atualiza em vez de duplicar (a constraint do banco impede
// a duplicata; o upsert mantém o comportamento idempotente).
@Injectable()
export class PrismaConsumosInsumoServicoRepository
  implements ConsumosInsumoServicoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async salvar(consumo: ConsumoInsumoServico): Promise<void> {
    const data = PrismaConsumoInsumoServicoMapper.toPrisma(consumo);

    await this.prisma.consumoInsumoServico.upsert({
      where: {
        negocioId_servicoId_produtoId: {
          negocioId: data.negocioId,
          servicoId: data.servicoId,
          produtoId: data.produtoId,
        },
      },
      create: data,
      update: data,
    });
  }

  async listarPorServico(
    negocioId: string,
    servicoId: string,
  ): Promise<ConsumoInsumoServico[]> {
    const consumos = await this.prisma.consumoInsumoServico.findMany({
      where: { negocioId, servicoId },
      orderBy: { criadoEm: "asc" },
    });

    return consumos.map(PrismaConsumoInsumoServicoMapper.toDomain);
  }

  async buscarPorId(
    negocioId: string,
    consumoId: string,
  ): Promise<ConsumoInsumoServico | null> {
    const consumo = await this.prisma.consumoInsumoServico.findFirst({
      where: { id: consumoId, negocioId },
    });

    return consumo ? PrismaConsumoInsumoServicoMapper.toDomain(consumo) : null;
  }

  async remover(negocioId: string, consumoId: string): Promise<void> {
    await this.prisma.consumoInsumoServico.deleteMany({
      where: { id: consumoId, negocioId },
    });
  }
}
