import { StatusServico } from "./status_servico_types";

// Item de um pacote: referência a um serviço + quantidade.
// O pacote não carrega a entidade Servico inteira — apenas a referência.
export interface ItemPacoteServicoProps {
  id: string;
  servicoId: string;
  descricao?: string | null;
  quantidade: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Propriedades da entidade PacoteServico.
// Combinação de serviços vendida como pacote (item composto do catálogo).
export interface PacoteServicoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  itens: ItemPacoteServicoProps[];
  precoPacote: number;
  status: StatusServico;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo PacoteServico.
export interface CriarPacoteServicoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
  precoPacote: number;
  observacoes?: string | null;
}
