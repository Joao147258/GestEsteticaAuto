// Dados que o CriarVeiculoUseCase precisa para criar um veículo.
// negocioId e clienteId são obrigatórios: todo veículo pertence a um negócio
// e a um cliente. marca/modelo são obrigatórios no domínio; placa é opcional
// porque o cliente pode pedir orçamento antes de informar a placa.
// Adaptação ao domínio: o domínio não tem "ano" único — usa anoFabricacao e
// anoModelo separados. chassi/renavam/quilometragem são campos que o domínio
// já aceita na criação.
export type CriarVeiculoInput = {
  negocioId: string;
  clienteId: string;

  placa?: string;
  marca: string;
  modelo: string;
  anoFabricacao?: number;
  anoModelo?: number;
  cor?: string;
  chassi?: string;
  renavam?: string;
  quilometragem?: number;

  observacoes?: string;
};
