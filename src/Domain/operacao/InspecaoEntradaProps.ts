// Propriedades da entidade InspecaoEntrada.
// Registra o estado geral do veículo ao chegar (protege cliente e empresa).
// SEPARADA do checklist: aqui é o estado do veículo, não a lista de conferência.
export interface InspecaoEntradaProps {
  id: string;
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  quilometragem?: number | null;
  nivelCombustivel?: string | null;
  avarias?: string[];
  itensPessoais?: string[];
  observacoesGerais?: string | null;
  responsavelId?: string | null;
  inspecionadoEm: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova InspecaoEntrada.
export interface CriarInspecaoEntradaProps {
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  quilometragem?: number | null;
  nivelCombustivel?: string | null;
  avarias?: string[];
  itensPessoais?: string[];
  observacoesGerais?: string | null;
  responsavelId?: string | null;
  inspecionadoEm?: Date;
}
