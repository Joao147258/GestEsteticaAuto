import { Injectable } from "@nestjs/common";
import { EstoqueInterno } from "../../../../Domain";
import { EstoqueInternoRepository } from "../../../../Application/estoque_interno/repositories/estoque-interno.repository";
import { PrismaService } from "../prisma.service";
import { PrismaEstoqueInternoMapper } from "../mappers/prisma-estoque-interno.mapper";
import { PrismaMovimentacaoEstoqueInternoMapper } from "../mappers/prisma-movimentacao-estoque-interno.mapper";

// PrismaEstoqueInternoRepository — implementação concreta do contrato de
// estoque interno. Salva o agregado preservando o histórico de movimentações
// (nunca apaga). O existeMovimentacaoPorOrigem garante baixa idempotente da
// operação (proteção contra baixa duplicada).
@Injectable()
export class PrismaEstoqueInternoRepository implements EstoqueInternoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Upsert do estoque + criação apenas das movimentações que ainda não existem.
  // Movimentação é histórico real: não usar deleteMany/createMany aqui.
  async salvar(estoque: EstoqueInterno): Promise<void> {
    const data = PrismaEstoqueInternoMapper.toPrisma(estoque);
    const movimentacoes = estoque.movimentacoes.map(
      PrismaMovimentacaoEstoqueInternoMapper.toPrisma,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.estoqueInterno.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });

      for (const mov of movimentacoes) {
        const existente = await tx.movimentacaoEstoqueInterno.findUnique({
          where: { id: mov.id },
        });
        if (!existente) {
          await tx.movimentacaoEstoqueInterno.create({ data: mov });
        }
      }
    });
  }

  async buscarPorProduto(
    negocioId: string,
    produtoId: string,
  ): Promise<EstoqueInterno | null> {
    const estoque = await this.prisma.estoqueInterno.findFirst({
      where: { negocioId, produtoId },
      include: { movimentacoes: true },
    });

    return estoque ? PrismaEstoqueInternoMapper.toDomain(estoque) : null;
  }

  // Chave de idempotência: negocioId + referenciaTipo + referenciaId +
  // referenciaItemId + produtoId. Nunca usar motivo/observação como chave.
  async existeMovimentacaoPorOrigem(params: {
    negocioId: string;
    referenciaTipo: string;
    referenciaId: string;
    referenciaItemId?: string;
    produtoId?: string;
  }): Promise<boolean> {
    const movimentacao = await this.prisma.movimentacaoEstoqueInterno.findFirst({
      where: {
        negocioId: params.negocioId,
        referenciaTipo: params.referenciaTipo,
        referenciaId: params.referenciaId,
        referenciaItemId: params.referenciaItemId ?? null,
        ...(params.produtoId ? { produtoId: params.produtoId } : {}),
      },
    });

    return !!movimentacao;
  }
}
