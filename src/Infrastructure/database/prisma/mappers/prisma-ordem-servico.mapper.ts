import { OrdemServico, StatusOrdemServico } from "../../../../Domain/operacao";
import type {
  OrdemServico as PrismaOrdemServico,
  ItemOrdemServico as PrismaItemOrdemServico,
} from "../../../../generated/prisma/client";
import { PrismaItemOrdemServicoMapper } from "./prisma-item-ordem-servico.mapper";

// PrismaOrdemServicoMapper — ponte entre o agregado OrdemServico (Prisma) e o
// Domain. Reconstrói a OS com os itens de execução. Na V1, inspeção, checklist,
// fotos e observações técnicas NÃO são reconstruídos (ficam vazios): não há
// use-cases que os manipulem ainda — esses dados, quando existirem, são
// preservados no banco (o salvar não os apaga).
export class PrismaOrdemServicoMapper {
  static toDomain(
    raw: PrismaOrdemServico & { itens?: PrismaItemOrdemServico[] },
  ): OrdemServico {
    return OrdemServico.reconstituir({
      id: raw.id,
      negocioId: raw.negocioId,
      clienteId: raw.clienteId,
      veiculoId: raw.veiculoId,
      orcamentoId: raw.orcamentoId ?? null,
      agendamentoId: raw.agendamentoId ?? null,
      numero: raw.numero ?? null,
      itens: (raw.itens ?? []).map(PrismaItemOrdemServicoMapper.toDomain),
      inspecaoEntrada: null,
      checklist: null,
      fotos: [],
      observacoesTecnicas: [],
      status: PrismaOrdemServicoMapper.toDomainStatus(raw.status),
      responsavelId: raw.responsavelId ?? null,
      abertaEm: raw.abertaEm,
      iniciadaEm: raw.iniciadaEm ?? null,
      pausadaEm: raw.pausadaEm ?? null,
      finalizadaEm: raw.finalizadaEm ?? null,
      entregueEm: raw.entregueEm ?? null,
      canceladaEm: raw.canceladaEm ?? null,
      previsaoInicio: raw.previsaoInicio ?? null,
      previsaoConclusao: raw.previsaoConclusao ?? null,
      observacoes: raw.observacoes ?? null,
      alteracoes: [],
      criadoEm: raw.criadoEm,
      atualizadoEm: raw.atualizadoEm,
    });
  }

  static toPrisma(ordemServico: OrdemServico) {
    return {
      id: ordemServico.id,
      negocioId: ordemServico.negocioId,
      clienteId: ordemServico.clienteId,
      veiculoId: ordemServico.veiculoId,
      orcamentoId: ordemServico.orcamentoId ?? null,
      agendamentoId: ordemServico.agendamentoId ?? null,
      numero: ordemServico.numero ?? null,
      responsavelId: ordemServico.responsavelId ?? null,
      status: ordemServico.status,
      observacoes: ordemServico.observacoes ?? null,
      abertaEm: ordemServico.abertaEm,
      iniciadaEm: ordemServico.iniciadaEm ?? null,
      pausadaEm: ordemServico.pausadaEm ?? null,
      finalizadaEm: ordemServico.finalizadaEm ?? null,
      entregueEm: ordemServico.entregueEm ?? null,
      canceladaEm: ordemServico.canceladaEm ?? null,
      previsaoInicio: ordemServico.previsaoInicio ?? null,
      previsaoConclusao: ordemServico.previsaoConclusao ?? null,
      criadoEm: ordemServico.criadoEm,
      atualizadoEm: ordemServico.atualizadoEm,
    };
  }

  private static toDomainStatus(status: string): StatusOrdemServico {
    const valores: StatusOrdemServico[] = [
      "ABERTA",
      "AGUARDANDO_VEICULO",
      "EM_EXECUCAO",
      "PAUSADA",
      "CONCLUIDA",
      "ENTREGUE",
      "CANCELADA",
    ];
    return valores.includes(status as StatusOrdemServico)
      ? (status as StatusOrdemServico)
      : "ABERTA";
  }
}
