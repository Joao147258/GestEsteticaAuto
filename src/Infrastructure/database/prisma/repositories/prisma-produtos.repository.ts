import { Injectable } from "@nestjs/common";
import { Produto } from "../../../../Domain";
import { ProdutosRepository } from "../../../../Application/catalogo/repositories/produtos.repository";
import { PrismaService } from "../prisma.service";
import { PrismaProdutoMapper } from "../mappers/prisma-produto.mapper";

// PrismaProdutosRepository — implementação concreta do contrato de produtos.
// Na V1 o contrato expõe apenas buscarPorId (produtos são consultados pelo
// comercial/estoque para validar existência e ler tipoUso/unidadeMedida).
@Injectable()
export class PrismaProdutosRepository implements ProdutosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(
    negocioId: string,
    produtoId: string,
  ): Promise<Produto | null> {
    const produto = await this.prisma.produto.findFirst({
      where: { id: produtoId, negocioId },
    });

    return produto ? PrismaProdutoMapper.toDomain(produto) : null;
  }
}
