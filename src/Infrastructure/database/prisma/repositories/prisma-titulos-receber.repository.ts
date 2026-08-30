import { Injectable } from "@nestjs/common";
import {
  OrigemTituloFinanceiro,
  StatusTituloFinanceiro,
  TituloFinanceiro,
} from "../../../../Domain";
import { TitulosReceberRepository } from "../../../../Application/financeiro/repositories/titulos-receber.repository";
import { PrismaService } from "../prisma.service";
import { PrismaTituloReceberMapper } from "../mappers/prisma-titulo-receber.mapper";
import { PrismaParcelaFinanceiraMapper } from "../mappers/prisma-parcela-financeira.mapper";
import { PrismaPagamentoMapper } from "../mappers/prisma-pagamento.mapper";

// PrismaTitulosReceberRepository — implementação concreta do contrato de
// títulos a receber. Salva o agregado em transação. Pagamentos são histórico:
// apenas cria registros novos, NUNCA apaga. Parcelas são sincronizadas por
// upsert (têm status próprio de execução).
@Injectable()
export class PrismaTitulosReceberRepository implements TitulosReceberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(titulo: TituloFinanceiro): Promise<void> {
    const data = PrismaTituloReceberMapper.toPrisma(titulo);
    const parcelas = titulo.parcelas.map(PrismaParcelaFinanceiraMapper.toPrisma);
    const idsParcelas = parcelas.map((p) => p.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.titulo.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });

      // Parcelas: remove apenas as que saíram do agregado e faz upsert das
      // demais (preserva status e pagamentos vinculados).
      await tx.parcela.deleteMany({
        where: { tituloId: data.id, NOT: { id: { in: idsParcelas } } },
      });
      for (const parcela of parcelas) {
        await tx.parcela.upsert({
          where: { id: parcela.id },
          create: parcela,
          update: parcela,
        });
      }

      // Pagamentos: histórico real — só cria os que ainda não existem.
      for (const parcela of titulo.parcelas) {
        for (const pagamento of parcela.pagamentos) {
          const dataPagamento = PrismaPagamentoMapper.toPrisma(pagamento);
          const existente = await tx.pagamento.findUnique({
            where: { id: dataPagamento.id },
          });
          if (!existente) {
            await tx.pagamento.create({ data: dataPagamento });
          }
        }
      }
    });
  }

  async buscarPorId(
    negocioId: string,
    tituloId: string,
  ): Promise<TituloFinanceiro | null> {
    const titulo = await this.prisma.titulo.findFirst({
      where: { id: tituloId, negocioId },
      include: { parcelas: { include: { pagamentos: true } } },
    });

    return titulo ? PrismaTituloReceberMapper.toDomain(titulo) : null;
  }

  // Idempotência do GerarTituloReceber: no máximo um título por origem.
  async buscarPorOrigem(
    negocioId: string,
    origem: OrigemTituloFinanceiro,
    origemId: string,
  ): Promise<TituloFinanceiro | null> {
    const titulo = await this.prisma.titulo.findFirst({
      where: { negocioId, origem, origemId },
      include: { parcelas: { include: { pagamentos: true } } },
    });

    return titulo ? PrismaTituloReceberMapper.toDomain(titulo) : null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    origem?: OrigemTituloFinanceiro;
    origemId?: string;
    status?: StatusTituloFinanceiro;
    dataVencimentoInicio?: Date;
    dataVencimentoFim?: Date;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<TituloFinanceiro[]> {
    const {
      negocioId,
      clienteId,
      origem,
      origemId,
      status,
      dataVencimentoInicio,
      dataVencimentoFim,
      busca,
    } = params;
    const pagina = params.pagina ?? 1;
    const limite = params.limite ?? 20;

    const titulos = await this.prisma.titulo.findMany({
      where: {
        negocioId,
        ...(clienteId ? { clienteId } : {}),
        ...(origem ? { origem } : {}),
        ...(origemId ? { origemId } : {}),
        ...(status ? { status } : {}),
        ...(dataVencimentoInicio || dataVencimentoFim
          ? {
              dataVencimento: {
                ...(dataVencimentoInicio ? { gte: dataVencimentoInicio } : {}),
                ...(dataVencimentoFim ? { lte: dataVencimentoFim } : {}),
              },
            }
          : {}),
        ...(busca?.trim()
          ? {
              OR: [{ descricao: { contains: busca, mode: "insensitive" } }],
            }
          : {}),
      },
      include: { parcelas: { include: { pagamentos: true } } },
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { dataVencimento: "asc" },
    });

    return titulos.map(PrismaTituloReceberMapper.toDomain);
  }
}
