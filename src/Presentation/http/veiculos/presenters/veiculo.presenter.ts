import { Veiculo } from '../../../../Domain';

// VeiculoPresenter — ponto de projeção da resposta HTTP de veículos.
// Não expõe a entidade de domínio crua; normaliza campos para JSON.
export class VeiculoPresenter {
  static toHTTP(veiculo: Veiculo) {
    return {
      id: veiculo.id,
      negocioId: veiculo.negocioId,
      clienteId: veiculo.clienteId,
      placa: veiculo.placa,
      chassi: veiculo.chassi,
      renavam: veiculo.renavam,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      anoFabricacao: veiculo.anoFabricacao,
      anoModelo: veiculo.anoModelo,
      cor: veiculo.cor,
      quilometragem: veiculo.quilometragem,
      observacoes: veiculo.observacoes,
      status: veiculo.status,
      criadoEm: veiculo.criadoEm,
      atualizadoEm: veiculo.atualizadoEm,
    };
  }

  static manyToHTTP(veiculos: Veiculo[]) {
    return veiculos.map((veiculo) => this.toHTTP(veiculo));
  }
}
