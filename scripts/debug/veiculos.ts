// Depuração do módulo veículos (Veiculo).
import { Veiculo } from "../../src/Domain/veiculos/veiculo";
import { mostrar } from "./_utils";

export function executarVeiculos(): void {
  const veiculo = Veiculo.criar({
    negocioId: "neg-123",
    clienteId: "cli-1",
    placa: " ABC1D23 ",
    marca: "  Fiat  ",
    modelo: "  Uno 1.0  ",
    anoFabricacao: 2019,
    anoModelo: 2020,
    cor: "Prata",
    quilometragem: 45000,
  });

  mostrar("Veículo criado", {
    id: veiculo.id,
    clienteId: veiculo.clienteId,
    placa: veiculo.placa,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    anoFabricacao: veiculo.anoFabricacao,
    anoModelo: veiculo.anoModelo,
    cor: veiculo.cor,
    quilometragem: veiculo.quilometragem,
    status: veiculo.status,
  });

  veiculo.alterarKm(48000);
  veiculo.alterarCor("Preto");
  veiculo.inativar();

  mostrar("Veículo após alterações", {
    cor: veiculo.cor,
    quilometragem: veiculo.quilometragem,
    status: veiculo.status,
  });
}
