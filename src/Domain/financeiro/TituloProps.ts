import { ParcelaProps } from "./ParcelaProps";
import { StatusTitulo } from "./status_titulo_types";

// Propriedades da entidade Titulo.
// Cliente, Orcamento e OrdemServico referenciados por id.
// Pode conter parcelas (composição do agregado financeiro).
export interface TituloProps {
  id: string;
  negocioId: string;
  clienteId: string;
  orcamentoId?: string | null;
  ordemServicoId?: string | null;
  descricao?: string | null;
  valorTotal: number;
  status: StatusTitulo;
  dataEmissao: Date;
  dataVencimento?: Date | null;
  parcelas?: ParcelaProps[];
  criadoEm: Date;
  atualizadoEm: Date;
}
