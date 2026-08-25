import { StatusServico } from "./status_servico_types";
import { RegistroAlteracaoCatalogo } from "./catalogo_types";

// Propriedades da entidade Servico.
// O serviço do catálogo é apenas o modelo/base do que pode ser executado.
export interface ServicoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  categoriaId?: string | null;
  precoBase: number;
  duracaoEstimadaMinutos?: number | null;
  status: StatusServico;
  observacoes?: string | null;
  alteracoes: RegistroAlteracaoCatalogo[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Servico.
export interface CriarServicoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
  categoriaId?: string | null;
  precoBase: number;
  duracaoEstimadaMinutos?: number | null;
  observacoes?: string | null;
}
