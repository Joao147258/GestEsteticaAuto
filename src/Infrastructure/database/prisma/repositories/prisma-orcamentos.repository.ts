import { Injectable } from "@nestjs/common";
import { Orcamento, StatusOrcamento, OrigemOrcamento } from "../../../../Domain/comercial";
import { OrcamentosRepository } from "../../../../Application/comercial/repositories/OrcamentosRepository";
import { PrismaService } from "../prisma.service";
import { PrismaOrcamentoMapper } from "../mappers/prisma-orcamento.mapper";
import { PrismaItemOrcamentoMapper } from "../mappers/prisma-item-orcamento.mapper";
import { PrismaAceiteOrcamentoMapper } from "../mappers/prisma-aceite-orcamento.mapper";

// PrismaOrcamentosRepository — implementação concreta do contrato de
// orçamentos. Orçamento é um agregado (itens + aceite): o salvar usa
// transação para manter consistência. NÃO contém regra de negócio.
@Injectable()
export class PrismaOrcamentosRepository implements OrcamentosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Salva o agregado em uma transação: upsert do orçamento, sincronização
  // dos itens (deleteMany/createMany — composição editável na V1) e criação
  // de aceite novo SEM apagar histórico antigo.
  async salvar(orcamento: Orcamento): Promise<void> {
    const data = PrismaOrcamentoMapper.toPrisma(orcamento);
    const itens = orcamento.itens.map(PrismaItemOrcamentoMapper.toPrisma);
    const aceite = orcamento.aceite
      ? PrismaAceiteOrcamentoMapper.toPrisma(orcamento.aceite)
      : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.orcamento.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });

      await tx.itemOrcamento.deleteMany({ where: { orcamentoId: data.id } });
      if (itens.length > 0) {
        await tx.itemOrcamento.createMany({ data: itens });
      }

      // Aceite é histórico: só cria se o registro ainda não existe. Nunca
      // apaga nem reescreve aceites antigos.
      if (aceite) {
        const existente = await tx.aceiteOrcamento.findUnique({
          where: { id: aceite.id },
        });
        if (!existente) {
          await tx.aceiteOrcamento.create({ data: aceite });
        }
      }
    });
  }

  async buscarPorId(
    negocioId: string,
    orcamentoId: string,
  ): Promise<Orcamento | null> {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id: orcamentoId, negocioId },
      include: { itens: true, aceites: true },
    });

    return orcamento ? PrismaOrcamentoMapper.toDomain(orcamento) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    veiculoId?: string;
    origem?: OrigemOrcamento;
    status?: StatusOrcamento;
    dataInicio?: Date;
    dataFim?: Date;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Orcamento[]> {
    const {
      negocioId,
      clienteId,
      veiculoId,
      origem,
      status,
      dataInicio,
      dataFim,
      busca,
    } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const orcamentos = await this.prisma.orcamento.findMany({
      where: {
        negocioId,
        ...(clienteId ? { clienteId } : {}),
        ...(veiculoId ? { veiculoId } : {}),
        ...(origem ? { origem } : {}),
        ...(status ? { status } : {}),
        ...(dataInicio || dataFim
          ? {
              criadoEm: {
                ...(dataInicio ? { gte: dataInicio } : {}),
                ...(dataFim ? { lte: dataFim } : {}),
              },
            }
          : {}),
        ...(busca?.trim()
          ? {
              OR: [
                { numero: { contains: busca, mode: "insensitive" } },
                { observacoes: { contains: busca, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { itens: true, aceites: true },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { criadoEm: "desc" },
    });

    return orcamentos.map(PrismaOrcamentoMapper.toDomain);
  }

  async remover(negocioId: string, orcamentoId: string): Promise<void> {
    await this.prisma.orcamento.deleteMany({
      where: { id: orcamentoId, negocioId },
    });
  }
}
