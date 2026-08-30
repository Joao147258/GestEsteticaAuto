import { ItemOrdemServicoProps, StatusItemOrdemServico } from "../../../../Domain/operacao";
import type { ItemOrdemServico as PrismaItemOrdemServico } from "../../../../generated/prisma/client";

// PrismaItemOrdemServicoMapper — converte ItemOrdemServico entre Prisma e
// Domain. O item da operação é focado em execução; os campos comerciais
// legados do banco (produtoId, quantidade, valorUnitario, desconto) NÃO são
// mapeados para o domínio.
export class PrismaItemOrdemServicoMapper {
  static toDomain(raw: PrismaItemOrdemServico): ItemOrdemServicoProps {
    return {
      id: raw.id,
      negocioId: raw.negocioId,
      ordemServicoId: raw.ordemServicoId,
      servicoId: raw.servicoId ?? null,
      descricao: raw.descricao ?? "",
      status: PrismaItemOrdemServicoMapper.toDomainStatus(raw.status),
      responsavelId: raw.responsavelId ?? null,
      iniciadoEm: raw.iniciadoEm ?? null,
      finalizadoEm: raw.finalizadoEm ?? null,
      observacoes: raw.observacoes ?? null,
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    };
  }

  static toPrisma(item: ItemOrdemServicoProps) {
    return {
      id: item.id,
      negocioId: item.negocioId,
      ordemServicoId: item.ordemServicoId,
      servicoId: item.servicoId ?? null,
      descricao: item.descricao,
      status: item.status,
      responsavelId: item.responsavelId ?? null,
      iniciadoEm: item.iniciadoEm ?? null,
      finalizadoEm: item.finalizadoEm ?? null,
      observacoes: item.observacoes ?? null,
      criadoEm: item.criadoEm,
      atualizadoEm: item.atualizadoEm,
    };
  }

  private static toDomainStatus(status: string): StatusItemOrdemServico {
    const valores: StatusItemOrdemServico[] = [
      "PENDENTE",
      "EM_EXECUCAO",
      "CONCLUIDO",
      "CANCELADO",
    ];
    return valores.includes(status as StatusItemOrdemServico)
      ? (status as StatusItemOrdemServico)
      : "PENDENTE";
  }
}
