import { Injectable } from "@nestjs/common";
import { OrdemServico, StatusOrdemServico } from "../../../../Domain";
import { OrdensServicoRepository } from "../../../../Application/operacao/repositories/ordens-servico.repository";
import { PrismaService } from "../prisma.service";
import { PrismaOrdemServicoMapper } from "../mappers/prisma-ordem-servico.mapper";
import { PrismaItemOrdemServicoMapper } from "../mappers/prisma-item-ordem-servico.mapper";

// PrismaOrdensServicoRepository — implementação concreta do contrato de OS.
// Salva o agregado em transação: upsert da OS + sincronização dos itens por
// upsert (o item tem status de execução — PENDENTE/EM_EXECUCAO/CONCLUIDO — e
// não pode ser recriado do zero, senão perde o andamento). Removidos da OS
// são apagados (o domínio os tirou do agregado).
@Injectable()
export class PrismaOrdensServicoRepository implements OrdensServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(ordemServico: OrdemServico): Promise<void> {
    const data = PrismaOrdemServicoMapper.toPrisma(ordemServico);
    const itens = ordemServico.itens.map(PrismaItemOrdemServicoMapper.toPrisma);
    const idsItens = itens.map((item) => item.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.ordemServico.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });

      // Remove apenas os itens que não estão mais no agregado do domínio.
      await tx.itemOrdemServico.deleteMany({
        where: { ordemServicoId: data.id, NOT: { id: { in: idsItens } } },
      });

      // Upsert por item preserva o status e o histórico de execução.
      for (const item of itens) {
        await tx.itemOrdemServico.upsert({
          where: { id: item.id },
          create: item,
          update: item,
        });
      }
    });
  }

  async buscarPorId(
    negocioId: string,
    ordemServicoId: string,
  ): Promise<OrdemServico | null> {
    const os = await this.prisma.ordemServico.findFirst({
      where: { id: ordemServicoId, negocioId },
      include: { itens: true },
    });

    return os ? PrismaOrdemServicoMapper.toDomain(os) : null;
  }

  // Idempotência do GerarOrdemServico: no máximo uma OS por orçamento.
  async buscarPorOrcamento(
    negocioId: string,
    orcamentoId: string,
  ): Promise<OrdemServico | null> {
    const os = await this.prisma.ordemServico.findFirst({
      where: { negocioId, orcamentoId },
      include: { itens: true },
    });

    return os ? PrismaOrdemServicoMapper.toDomain(os) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    status?: StatusOrdemServico;
    clienteId?: string;
    veiculoId?: string;
    orcamentoId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<OrdemServico[]> {
    const {
      negocioId,
      status,
      clienteId,
      veiculoId,
      orcamentoId,
      busca,
      dataInicio,
      dataFim,
    } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const ordens = await this.prisma.ordemServico.findMany({
      where: {
        negocioId,
        ...(status ? { status } : {}),
        ...(clienteId ? { clienteId } : {}),
        ...(veiculoId ? { veiculoId } : {}),
        ...(orcamentoId ? { orcamentoId } : {}),
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
      include: { itens: true },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { criadoEm: "desc" },
    });

    return ordens.map(PrismaOrdemServicoMapper.toDomain);
  }
}
