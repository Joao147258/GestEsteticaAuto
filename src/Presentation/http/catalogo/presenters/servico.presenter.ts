import { ConsumoInsumoServico, Servico } from '../../../../Domain';

// ServicoPresenter — padroniza a saída JSON de serviços exposta pela API HTTP.
// Evita vazamento de atributos internos e garante nomes e formatos consistentes.
export class ServicoPresenter {
  static toHTTP(servico: Servico) {
    return {
      id: servico.id,
      negocioId: servico.negocioId,
      nome: servico.nome,
      descricao: servico.descricao ?? null,
      categoriaId: servico.categoriaId ?? null,
      precoBase: servico.precoBase,
      duracaoEstimadaMinutos: servico.duracaoEstimadaMinutos ?? null,
      observacoes: servico.observacoes ?? null,
      status: servico.status,
      criadoEm: servico.criadoEm,
      atualizadoEm: servico.atualizadoEm,
    };
  }

  static manyToHTTP(servicos: Servico[]) {
    return servicos.map((servico) => this.toHTTP(servico));
  }
}

// ConsumoInsumoServicoPresenter — padroniza a saída JSON da ficha técnica de consumo.
export class ConsumoInsumoServicoPresenter {
  static toHTTP(consumo: ConsumoInsumoServico) {
    return {
      id: consumo.id,
      negocioId: consumo.negocioId,
      servicoId: consumo.servicoId,
      produtoId: consumo.produtoId,
      quantidade: consumo.quantidade,
      unidadeMedida: consumo.unidadeMedida,
      criadoEm: consumo.criadoEm,
      atualizadoEm: consumo.atualizadoEm,
    };
  }

  static manyToHTTP(consumos: ConsumoInsumoServico[]) {
    return consumos.map((consumo) => this.toHTTP(consumo));
  }
}
