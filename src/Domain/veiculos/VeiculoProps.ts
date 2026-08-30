import { StatusVeiculo } from "./status_veiculo_types";

// Registro de uma alteração feita no veículo (rastreabilidade do domínio).
export interface RegistroAlteracaoVeiculo {
  campo: string;
  valorAnterior: string | number | null;
  valorNovo: string | number | null;
  alteradoEm: Date;
  alteradoPor?: string | null;
  descricao?: string | null;
}

// Propriedades da entidade Veiculo.
// Cliente referenciado por id (integração simples, sem composição).
export interface VeiculoProps {
  id: string;
  negocioId: string;
  clienteId: string;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anoFabricacao?: number | null;
  anoModelo?: number | null;
  cor?: string | null;
  chassi?: string | null;
  renavam?: string | null;
  quilometragem?: number | null;
  observacoes?: string | null;
  status: StatusVeiculo;
  alteracoes: RegistroAlteracaoVeiculo[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Veiculo.
// Sem histórico de troca de proprietário e sem validação real de placa nesta etapa.
export interface CriarVeiculoProps {
  negocioId: string;
  clienteId: string;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anoFabricacao?: number | null;
  anoModelo?: number | null;
  cor?: string | null;
  chassi?: string | null;
  renavam?: string | null;
  quilometragem?: number | null;
  observacoes?: string | null;
}

// Dados operacionais editáveis de um Veiculo (sem troca de cliente — isso é
// ação específica via vincularCliente). undefined preserva o valor atual.
export interface DadosAtualizacaoVeiculo {
  placa?: string | null;
  marca?: string;
  modelo?: string;
  anoFabricacao?: number;
  anoModelo?: number;
  cor?: string | null;
  quilometragem?: number;
  observacoes?: string | null;
}
