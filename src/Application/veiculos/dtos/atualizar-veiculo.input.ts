// Entrada do AtualizarVeiculoUseCase.
// Sem clienteId: trocar o dono do veículo é uma ação específica (futuro
// TransferirVeiculoParaClienteUseCase, via Veiculo.vincularCliente) e gera
// histórico confuso se feita na atualização comum.
// Observação: o domínio ainda não tem método para alterar observacoes —
// decisão quando o use-case for implementado (criar o método ou remover o campo).
export type AtualizarVeiculoInput = {
  negocioId: string;
  veiculoId: string;

  placa?: string;
  marca?: string;
  modelo?: string;
  anoFabricacao?: number;
  anoModelo?: number;
  cor?: string;
  quilometragem?: number;

  observacoes?: string;
};
