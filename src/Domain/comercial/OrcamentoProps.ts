import { ItemOrcamentoProps } from "./ItemOrcamentoProps";
import { AceiteOrcamentoProps } from "./AceiteOrcamentoProps";
import { StatusOrcamento } from "./status_orcamento_types";
import { OrigemOrcamento } from "./origem_orcamento_types";
import { RegistroAlteracaoComercial } from "./comercial_types";

// Propriedades da entidade Orcamento.
// Agregado principal do comercial: uma proposta feita para um cliente.
// Valores (subtotal/desconto/acréscimo/total) são calculados pelo domínio.
export interface OrcamentoProps {
  id: string;
  negocioId: string;
  clienteId: string;
  veiculoId?: string | null;
  // Canal de entrada: PAINEL (padrão) ou SITE (futuro). O site usa o mesmo
  // fluxo de orçamento — apenas informa a origem na criação.
  origem: OrigemOrcamento;
  itens: ItemOrcamentoProps[];
  politicaComercialId?: string | null;
  condicaoComercialId?: string | null;
  subtotal: number;
  valorDesconto: number;
  valorAcrescimo: number;
  valorTotal: number;
  status: StatusOrcamento;
  observacoes?: string | null;
  validoAte?: Date | null;
  aceite?: AceiteOrcamentoProps | null;
  alteracoes: RegistroAlteracaoComercial[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Orcamento.
// Começa como RASCUNHO, sem itens e com valores zerados.
export interface CriarOrcamentoProps {
  negocioId: string;
  clienteId: string;
  veiculoId?: string | null;
  // Opcional: quando ausente, o orçamento nasce com origem PAINEL.
  origem?: OrigemOrcamento;
  observacoes?: string | null;
  validoAte?: Date | null;
  politicaComercialId?: string | null;
  condicaoComercialId?: string | null;
}
